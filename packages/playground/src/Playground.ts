import { deleteGeneratedBundle, storeGeneratedBundle } from './GeneratedBundleStorage.ts'
import { setupPreview } from './SetupPreview.ts'
import { setupPreviewDivider } from './SetupPreviewDivider.ts'

const relativePathPrefix = /^\.\//
const trailingSlash = /\/$/

type Invoke = (command: string, ...args: readonly unknown[]) => Promise<any>
type Files = Record<string, string>
interface BuildOutput {
  readonly code: string
  readonly generated: string
}
interface Sample {
  readonly id: string
  readonly preview?: {
    readonly entry: string
    readonly files: Files
  }
  readonly route: string
  readonly title: string
}

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Unable to load ${url}: ${response.status}`)
  return response.json()
}

const readIcons = (paths: readonly string[], files: Files): readonly string[] =>
  paths.map((path) => {
    const content = files[`/${path.replace(relativePathPrefix, '')}`]
    if (typeof content !== 'string') throw new Error(`Missing icon: ${path}`)
    return content
  })

export const mountPlayground = async (
  invoke: Invoke,
  prefix: string,
  sourceExtensions: readonly unknown[],
  invokeShortcut: Invoke,
): Promise<void> => {
  setupPreviewDivider()
  // Rebuild each saved source snapshot after formatting has finished.
  await invoke('Preferences.update', {
    'editor.diagnostics': true,
    'editor.formatActions': 'pre-save',
    'editor.formatOnSave': true,
    'editor.lineNumbers': true,
  })
  const sourceId = 'source'
  const previewId = 'preview'
  const sampleId = document.body.dataset.sampleId || 'file-system-provider'
  const [samples, initialFiles, ignoreHashes, tooling] = await Promise.all([
    fetchJson<Sample[]>(`${prefix}/samples.json`),
    fetchJson<Files>(`${prefix}/samples/${sampleId}/files.json`),
    fetchJson<readonly string[]>(`${prefix}/samples/${sampleId}/eslint-ignore-hashes.json`),
    fetchJson<Files>(`${prefix}/tooling.json`),
  ])
  const sample = samples.find((sample) => sample.id === sampleId)
  const previewWorkspace = sampleId === 'file-system-provider' ? 'sample-memfs:///' : 'memfs:///preview'
  const previewFiles: Files =
    sample?.preview?.files ??
    (sampleId === 'file-system-provider'
      ? {}
      : {
          '/README.md': '# Preview workspace\n',
          '/src/main.ts': 'export const message = "Preview file"\n',
        })
  const picker = document.querySelector<HTMLSelectElement>('#sample-picker')!
  const status = document.querySelector<HTMLElement>('#preview-status')!
  for (const sample of samples) picker.add(new Option(sample.title, sample.route, false, sample.id === sampleId))
  picker.addEventListener('change', () => location.assign(`${prefix}/${picker.value}/`))
  const storageKey = `extension-samples:workspace:${sampleId}`
  document.querySelector('#reset-button')!.addEventListener('click', () => {
    try {
      localStorage.removeItem(storageKey)
    } finally {
      location.reload()
    }
  })
  let files = { ...initialFiles }
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null')
    if (stored && !Array.isArray(stored) && Object.entries(stored).every(([path, value]) => path.startsWith('/') && typeof value === 'string'))
      files = stored
  } catch {
    /* A corrupt draft must not prevent opening the sample. */
  }

  // Existing drafts predate the sample formatting defaults; preserve their other package fields.
  try {
    const packageJson = JSON.parse(files['/package.json'])
    if (packageJson.prettier === undefined) {
      packageJson.prettier = JSON.parse(initialFiles['/package.json']).prettier
      files['/package.json'] = `${JSON.stringify(packageJson, undefined, 2)}\n`
    }
  } catch {
    // Keep an unfinished package.json editable.
  }

  let compiler: Worker | undefined
  let nextBuild = 0
  const pending = new Map<number, { resolve: (code: BuildOutput) => void; reject: (error: Error) => void }>()
  let compilerError: Error | undefined
  const getCompiler = (): Worker => {
    if (compiler) return compiler
    compiler = new Worker(new URL('compiler.js', import.meta.url), { name: 'Sample compiler', type: 'module' })
    compiler.onerror = (event): void => {
      compilerError = new Error(event.message || 'The sample compiler stopped unexpectedly')
      for (const request of pending.values()) request.reject(compilerError)
      pending.clear()
    }
    compiler.onmessage = ({ data }: MessageEvent<{ id: number; code: string; generated: string; error?: string }>): void => {
      const request = pending.get(data.id)
      pending.delete(data.id)
      if (data.error) request?.reject(new Error(data.error))
      else request?.resolve(data)
    }
    return compiler
  }
  const compile = (): Promise<BuildOutput> =>
    new Promise((resolve, reject) => {
      if (compilerError) return reject(compilerError)
      const worker = getCompiler()
      const id = ++nextBuild
      pending.set(id, { reject, resolve })
      worker.postMessage({ files: { ...files }, id })
    })

  const getPreviewCode = async (): Promise<BuildOutput | undefined> => {
    const unchanged =
      Object.keys(files).length === Object.keys(initialFiles).length &&
      Object.entries(initialFiles).every(([path, content]) => files[path] === content)
    return unchanged ? undefined : compile()
  }

  const mount = async (id: string, workspaceUri: string, workspaceFiles: Files, extensions: readonly unknown[]): Promise<void> => {
    const root = document.querySelector<HTMLElement>(`#${id}-ide`)!
    const { height, width } = root.getBoundingClientRect()
    await invoke('Application.create', {
      extensions,
      files: Object.fromEntries(
        Object.entries(workspaceFiles).map(([path, content]) => [`${id === sourceId ? 'memfs:///sample' : workspaceUri}${path}`, content]),
      ),
      height,
      href: location.href,
      id,
      rootId: root.id,
      textFileExtensions: id === sourceId ? ['.svg'] : [],
      width,
      workspacePath: workspaceUri,
      workspaceUri,
    })
    const commands = ['Layout.hideTitleBar', 'Layout.hideStatusBar']
    if (id !== previewId || (sampleId !== 'source-control-provider' && sampleId !== 'sidebar-counter' && sampleId !== 'color-view'))
      commands.push('Layout.hideActivityBar')
    commands.push('Layout.moveSideBarLeft', 'Layout.showSideBar')
    for (const command of commands) {
      await invoke('Application.execute', id, command)
    }
    await invoke('Application.execute', id, 'Layout.openSideBarViewlet', 'Explorer')
    if (id === previewId && sampleId === 'source-control-provider') {
      root.addEventListener(
        'mousedown',
        (event) => {
          const { target } = event
          if (!(target instanceof Element)) return
          const item = target.closest<HTMLElement>('.ActivityBarItem')
          const viewlet = item?.title
          if (!item || (viewlet !== 'Explorer' && viewlet !== 'Source Control') || item.getAttribute('aria-selected') === 'true') return
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          void invoke('Application.execute', id, 'Layout.openSideBarViewlet', viewlet)
        },
        { capture: true },
      )
    }
  }

  const observers: ResizeObserver[] = []
  // Custom views can receive pointer input without moving DOM focus.
  let activeApplicationId = sourceId
  document.addEventListener(
    'keydown',
    (event) => {
      const isCommandPaletteShortcut =
        (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key === 'F1') ||
        ((event.ctrlKey || event.metaKey) && !event.altKey && event.shiftKey && event.key.toLowerCase() === 'p')
      if (!isCommandPaletteShortcut) return
      event.preventDefault()
      event.stopImmediatePropagation()
      void invokeShortcut('Application.execute', activeApplicationId, 'Viewlet.openWidget', 'QuickPick', 'everything').catch((error) => {
        status.textContent = String(error)
      })
    },
    { capture: true },
  )
  for (const id of [sourceId, previewId]) {
    const root = document.querySelector<HTMLElement>(`#${id}-ide`)!
    const activateApplication = (): void => {
      activeApplicationId = id
    }
    root.addEventListener('pointerdown', activateApplication, { capture: true })
    root.addEventListener('focusin', activateApplication)
    // The shared shortcut dispatcher does not carry the application's identity.
    // Save the editor that received the shortcut through its owning application.
    root.addEventListener(
      'keydown',
      (event) => {
        if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey || event.key.toLowerCase() !== 's') return
        const editor = event.target instanceof Element ? event.target.closest<HTMLElement>('.Editor[data-uid]') : null
        if (!editor || !root.contains(editor)) return
        event.preventDefault()
        event.stopImmediatePropagation()
        void invokeShortcut('Application.execute', id, 'Viewlet.executeViewletCommand', Number(editor.dataset.uid), 'Editor.save').catch((error) => {
          status.textContent = String(error)
        })
      },
      { capture: true },
    )
    // Editor workers use coordinates relative to their application's viewport.
    for (const type of ['pointerdown', 'pointermove', 'pointerup', 'mousedown', 'mousemove', 'mouseup', 'click', 'dblclick', 'contextmenu']) {
      root.addEventListener(
        type,
        (event) => {
          const pointer = event as MouseEvent
          const { left, top } = root.getBoundingClientRect()
          Object.defineProperties(pointer, { clientX: { value: pointer.clientX - left }, clientY: { value: pointer.clientY - top } })
        },
        { capture: true },
      )
    }
  }

  let generatedUrl: string | undefined
  let previewExists = false
  let previewExtensionId = ''
  const previewUrls = new Set<string>()
  let revision = 0
  let running = false
  let requested = false
  const createPreviewUrl = (code: string | undefined): string =>
    code === undefined
      ? new URL(`${prefix}/samples/${sampleId}/main.js`, location.href).href
      : URL.createObjectURL(new Blob([code], { type: 'text/javascript' }))
  const updatePreview = async (
    code: string | undefined,
    manifest: { readonly id: string; readonly [key: string]: unknown },
    icons: readonly string[],
  ): Promise<void> => {
    const needsSetup = !previewExists
    const nextIconUrls = icons.map((content: string) => URL.createObjectURL(new Blob([content], { type: 'image/svg+xml' })))
    const nextPreviewUrl = createPreviewUrl(code)
    const extension = {
      ...manifest,
      browser: nextPreviewUrl,
      contentSecurityPolicy: [],
      isWeb: true,
      path: location.origin,
      'source-control-icons': nextIconUrls,
      uri: location.origin,
    }
    previewUrls.add(nextPreviewUrl)
    for (const url of nextIconUrls) previewUrls.add(url)
    if (previewExists) {
      await invoke('Application.execute', previewId, 'Extensions.reload', previewExtensionId, extension)
    } else {
      await mount(previewId, previewWorkspace, previewFiles, [extension])
      previewExists = true
      await invoke(
        'Application.execute',
        previewId,
        'Main.openUri',
        `${previewWorkspace.replace(trailingSlash, '')}${sample?.preview?.entry || '/README.md'}`,
        false,
      )
    }
    if (Array.isArray(manifest.activation) && manifest.activation.includes('onEditorTextDecoration')) {
      await invoke('Application.execute', previewId, 'Editor.refreshTextDecorations')
    }
    const retainedUrls = new Set([nextPreviewUrl, ...nextIconUrls])
    for (const url of previewUrls) {
      if (retainedUrls.has(url)) {
        continue
      }

      URL.revokeObjectURL(url)
      previewUrls.delete(url)
    }
    previewExtensionId = extension.id
    await setupPreview(
      files['/.lvce/setup-preview.js'],
      previewWorkspace,
      (command, ...args) => invoke('Application.execute', previewId, command, ...args),
      !needsSetup,
    )
  }
  const rebuild = async (): Promise<void> => {
    requested = true
    if (running) return
    running = true
    try {
      while (requested) {
        requested = false
        const started = performance.now()
        status.textContent = 'Building…'
        const output = await getPreviewCode()
        if (requested) continue
        const manifest = JSON.parse(files['/extension.json'])
        const icons = readIcons(manifest['source-control-icons'] || [], files)
        await updatePreview(output?.code, manifest, icons)
        const nextGeneratedUrl = output
          ? await storeGeneratedBundle(output.generated)
          : new URL(`${prefix}/samples/${sampleId}/dist/main.js`, location.href).href
        try {
          await invoke('Application.execute', sourceId, 'ExtensionHost.executeCommand', 'sampleSource.setGeneratedUrl', nextGeneratedUrl)
        } catch (error) {
          await deleteGeneratedBundle(nextGeneratedUrl)
          throw error
        }
        const previousGeneratedUrl = generatedUrl
        generatedUrl = nextGeneratedUrl
        try {
          await invoke('Application.execute', sourceId, 'Layout.handleWorkspaceRefresh', { changed: ['sample-source:///sample/dist/main.js'] })
        } finally {
          if (previousGeneratedUrl) await deleteGeneratedBundle(previousGeneratedUrl)
        }
        document.body.dataset.previewRevision = String(++revision)
        document.body.dataset.previewBuildMs = String(Math.round(performance.now() - started))
        status.textContent = 'Preview ready'
      }
    } catch (error) {
      status.textContent = String(error)
    } finally {
      running = false
      if (requested) void rebuild()
    }
  }
  const sourceProvider = {
    activation: ['onFileSystem:sample-source'],
    browser: new URL(`${prefix}/assets/source-files.js?sample=${encodeURIComponent(sampleId)}`, location.href).href,
    commands: [{ id: 'sampleSource.setGeneratedUrl' }],
    contentSecurityPolicy: [],
    fileSystemProviders: [{ id: 'sample-source' }],
    id: 'playground.source-files',
    isolated: true,
    isWeb: true,
    name: 'Sample source files',
    path: location.origin,
    uri: location.origin,
  }
  await mount(sourceId, 'sample-source:///sample', { ...tooling, ...files }, [...sourceExtensions, sourceProvider])
  await invoke('Application.execute', sourceId, 'Preferences.update', { 'eslint.ignoreHashes': ignoreHashes })
  await invoke('Application.execute', sourceId, 'Main.openUri', 'sample-source:///sample/src/main.ts')
  await rebuild()
  for (const id of [sourceId, previewId]) {
    const root = document.querySelector<HTMLElement>(`#${id}-ide`)!
    const observer = new ResizeObserver(() => {
      if (id === previewId && !previewExists) return
      const observedRevision = revision
      const { height, width } = root.getBoundingClientRect()
      if (width > 0 && height > 0)
        void invoke('Application.resize', id, width, height).catch((error) => {
          if (id !== previewId || (previewExists && revision === observedRevision)) status.textContent = String(error)
        })
    })
    observer.observe(root)
    observers.push(observer)
  }
  let reading = false
  let readRequested = false
  const readWorkspace = async (): Promise<void> => {
    readRequested = true
    if (reading) return
    reading = true
    try {
      while (readRequested) {
        readRequested = false
        const snapshot: Files = {}
        const visit = async (path: string): Promise<void> => {
          const entries = await invoke('Application.execute', sourceId, 'FileSystem.readDirWithFileTypes', `memfs:///sample${path}`)
          for (const entry of entries) {
            if (['node_modules', '.git', 'dist'].includes(entry.name)) continue
            const relative = `${path}/${entry.name}`
            if (entry.type === 3) await visit(relative)
            else snapshot[relative] = await invoke('Application.execute', sourceId, 'FileSystem.readFile', `memfs:///sample${relative}`)
          }
        }
        await visit('')
        if (readRequested) continue
        const unchanged =
          Object.keys(snapshot).length === Object.keys(files).length && Object.entries(files).every(([path, content]) => snapshot[path] === content)
        if (unchanged) continue
        files = snapshot
        try {
          localStorage.setItem(storageKey, JSON.stringify(files))
        } catch {
          // Storage can be unavailable or full; live editing must still work.
        }
        void rebuild()
      }
    } catch (error) {
      if (!readRequested) status.textContent = String(error)
    } finally {
      reading = false
      if (readRequested) void readWorkspace()
    }
  }
  globalThis.addEventListener('lvce-file-saved', (event) => {
    const { applicationId, uri } = (event as CustomEvent<{ applicationId: string; uri: string }>).detail
    if (applicationId !== sourceId || (!uri.startsWith('sample-source:///sample/') && !uri.startsWith('memfs:///sample/'))) return
    void readWorkspace()
  })
  document.body.dataset.playgroundReady = 'true'
  window.addEventListener(
    'pagehide',
    () => {
      compiler?.terminate()
      if (generatedUrl) void deleteGeneratedBundle(generatedUrl)
      for (const observer of observers) observer.disconnect()
      for (const url of previewUrls) URL.revokeObjectURL(url)
    },
    { once: true },
  )
}
