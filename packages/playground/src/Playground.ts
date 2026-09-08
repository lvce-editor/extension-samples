import { setupPreview } from './SetupPreview.ts'

type Invoke = (command: string, ...args: readonly unknown[]) => Promise<any>
type Files = Record<string, string>
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
    const content = files[`/${path.replace(/^\.\//, '')}`]
    if (typeof content !== 'string') throw new Error(`Missing icon: ${path}`)
    return content
  })

export const mountPlayground = async (invoke: Invoke, prefix: string, sourceExtensions: readonly unknown[]): Promise<void> => {
  await invoke('Preferences.update', { 'editor.diagnostics': true, 'editor.lineNumbers': true })
  const sourceId = 'source'
  const previewId = 'preview'
  const sampleId = document.body.dataset.sampleId || 'file-system-provider'
  const samples = await fetchJson<Sample[]>(`${prefix}/samples.json`)
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
  const initialFiles = await fetchJson<Files>(`${prefix}/samples/${sampleId}/files.json`)
  const tooling = await fetchJson<Files>(`${prefix}/tooling.json`)
  let files = { ...initialFiles }
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null')
    if (stored && !Array.isArray(stored) && Object.entries(stored).every(([path, value]) => path.startsWith('/') && typeof value === 'string'))
      files = stored
  } catch {
    /* A corrupt draft must not prevent opening the sample. */
  }

  let compiler: Worker | undefined
  let nextBuild = 0
  const pending = new Map<number, { resolve: (code: string) => void; reject: (error: Error) => void }>()
  let compilerError: Error | undefined
  const getCompiler = (): Worker => {
    if (compiler) return compiler
    compiler = new Worker(new URL('compiler.js', import.meta.url), { name: 'Sample compiler', type: 'module' })
    compiler.onerror = (event): void => {
      compilerError = new Error(event.message || 'The sample compiler stopped unexpectedly')
      for (const request of pending.values()) request.reject(compilerError)
      pending.clear()
    }
    compiler.onmessage = ({ data }: MessageEvent<{ id: number; code: string; error?: string }>): void => {
      const request = pending.get(data.id)
      pending.delete(data.id)
      if (data.error) request?.reject(new Error(data.error))
      else request?.resolve(data.code)
    }
    return compiler
  }
  const compile = (): Promise<string> =>
    new Promise((resolve, reject) => {
      if (compilerError) return reject(compilerError)
      const worker = getCompiler()
      const id = ++nextBuild
      pending.set(id, { reject, resolve })
      worker.postMessage({ files: { ...files }, id })
    })

  const getPreviewCode = async (): Promise<string | undefined> => {
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
      files: Object.fromEntries(Object.entries(workspaceFiles).map(([path, content]) => [`${workspaceUri}${path}`, content])),
      height,
      href: location.href,
      id,
      rootId: root.id,
      textFileExtensions: id === sourceId ? ['.svg'] : [],
      width,
      workspacePath: workspaceUri,
      workspaceUri,
    })
    for (const command of ['Layout.hideTitleBar', 'Layout.hideStatusBar', 'Layout.hideActivityBar', 'Layout.moveSideBarLeft', 'Layout.showSideBar']) {
      await invoke('Application.execute', id, command)
    }
    await invoke('Application.execute', id, 'Layout.openSideBarViewlet', 'Explorer')
  }

  const observers: ResizeObserver[] = []
  for (const id of [sourceId, previewId]) {
    const root = document.querySelector<HTMLElement>(`#${id}-ide`)!
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
        `${previewWorkspace.replace(/\/$/, '')}${sample?.preview?.entry || '/README.md'}`,
        false,
      )
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
    if (needsSetup) {
      await setupPreview(files['/.lvce/setup-preview.js'], previewWorkspace, (command, ...args) =>
        invoke('Application.execute', previewId, command, ...args),
      )
    }
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
        const code = await getPreviewCode()
        if (requested) continue
        const manifest = JSON.parse(files['/extension.json'])
        const icons = readIcons(manifest['source-control-icons'] || [], files)
        await updatePreview(code, manifest, icons)
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
  await mount(sourceId, 'memfs:///sample', { ...tooling, ...files }, sourceExtensions)
  await invoke('Application.execute', sourceId, 'Main.openUri', 'memfs:///sample/src/main.ts')
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
    if (applicationId !== sourceId || !uri.startsWith('memfs:///sample/')) return
    void readWorkspace()
  })
  document.body.dataset.playgroundReady = 'true'
  window.addEventListener(
    'pagehide',
    () => {
      compiler?.terminate()
      for (const observer of observers) observer.disconnect()
      for (const url of previewUrls) URL.revokeObjectURL(url)
    },
    { once: true },
  )
}
