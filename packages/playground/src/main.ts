import * as esbuild from 'esbuild-wasm'
import { previewApiSource } from './previewApi.ts'

interface Sample {
  readonly id: string
  readonly route: string
  readonly title: string
}

const getElement = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector)
  if (!element) {
    throw new Error(`Missing element: ${selector}`)
  }
  return element
}

const { body } = document
const sampleId = body.dataset.sampleId || 'file-system-provider'
const sourceUrl = body.dataset.sourceUrl || './samples/file-system-provider/src/main.ts'
const wasmUrl = body.dataset.wasmUrl || './assets/esbuild.wasm'
const routePrefix = body.dataset.routePrefix || '.'
const editor = getElement<HTMLTextAreaElement>('#source-editor')
const lineNumbers = getElement<HTMLElement>('#line-numbers')
const status = getElement<HTMLElement>('#build-status')
const dirtyIndicator = getElement<HTMLElement>('#dirty-indicator')
const preview = getElement<HTMLIFrameElement>('#preview-frame')
const samplePicker = getElement<HTMLSelectElement>('#sample-picker')
const storageKey = `lvce-extension-sample:${sampleId}`
const state = {
  buildId: 0,
  originalSource: '',
  previousPreviewUrl: '',
  savedSource: '',
}

const compilerReady = esbuild.initialize({ wasmURL: wasmUrl })

const updateLineNumbers = (): void => {
  const count = editor.value.split('\n').length
  lineNumbers.textContent = Array.from({ length: count }, (_, index) => String(index + 1)).join('\n')
}

const updateDirtyIndicator = (): void => {
  const dirty = editor.value !== state.savedSource
  dirtyIndicator.textContent = dirty ? '●' : ''
  dirtyIndicator.hidden = !dirty
}

const createPreviewDocument = (javascript: string): string => {
  const safeJavascript = javascript.replaceAll('</script', '<\\/script')
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #d7dbe0; background: #171a20; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: radial-gradient(circle at top right, #202d36, #171a20 52%); }
    #app { padding: 20px; }
    .ProviderTitle { color: #f4f7fa; font-size: 16px; font-weight: 650; }
    .ProviderSubtitle { color: #8c98a5; font: 12px ui-monospace, monospace; margin: 5px 0 14px; }
    .PreviewActions { display: flex; justify-content: flex-end; margin: 12px 0; }
    .PreviewButton, .IconButton, .RowAction, .FileRow { border: 0; color: inherit; font: inherit; }
    .PreviewButton { background: #277da1; border-radius: 5px; color: white; cursor: pointer; padding: 7px 12px; }
    .PreviewButton:hover { background: #3294bc; }
    .FileSystemLayout { border: 1px solid #313842; border-radius: 7px; display: grid; grid-template-columns: minmax(145px, 38%) 1fr; min-height: 280px; overflow: hidden; }
    .FileTree { background: #14171c; border-right: 1px solid #313842; padding: 7px 0; }
    .FileRow { background: transparent; cursor: pointer; display: block; font-size: 13px; padding: 6px 10px; text-align: left; width: 100%; }
    .FileRow:hover, .FileRow:focus { background: #252b34; outline: none; }
    .FilePreview { min-width: 0; padding: 14px; }
    .FileHeading { color: #8bd5ca; font: 12px ui-monospace, monospace; margin-bottom: 12px; }
    .FileContent { color: #d7dbe0; font: 13px/1.6 ui-monospace, monospace; margin: 0; overflow: auto; white-space: pre-wrap; }
    .CommitRow { display: grid; gap: 7px; grid-template-columns: 1fr auto auto; margin: 16px 0 20px; }
    .CommitInput { background: #101318; border: 1px solid #3b4551; border-radius: 5px; color: #f4f7fa; min-width: 0; outline: none; padding: 8px 10px; }
    .CommitInput:focus { border-color: #49a6cd; }
    .IconButton { background: #272d36; border-radius: 5px; cursor: pointer; padding: 0 10px; }
    .SourceControlGroup { border-top: 1px solid #313842; }
    .GroupHeading { align-items: center; display: flex; font-size: 12px; gap: 8px; margin: 0; padding: 12px 5px 8px; text-transform: uppercase; }
    .CountBadge { background: #313842; border-radius: 9px; color: #aeb7c2; font-size: 10px; padding: 1px 6px; }
    .ChangeRow { align-items: center; border-radius: 4px; display: grid; gap: 8px; grid-template-columns: 1fr auto auto; padding: 7px 8px; }
    .ChangeRow:hover { background: #242a32; }
    .ChangePath { font: 13px ui-monospace, monospace; overflow: hidden; text-overflow: ellipsis; }
    .ChangeBadge { color: #e4bc6d; font: bold 12px ui-monospace, monospace; }
    .RowAction { background: transparent; color: #80c7e5; cursor: pointer; font-size: 11px; }
    .RuntimeMessage { border-top: 1px solid #313842; color: #91a0ae; font-size: 12px; margin: 0 20px; padding: 10px 0; }
    .RuntimeError { color: #ff8b8b; font: 13px/1.5 ui-monospace, monospace; padding: 20px; white-space: pre-wrap; }
    @media (max-width: 560px) { .FileSystemLayout { grid-template-columns: 1fr; } .FileTree { border-bottom: 1px solid #313842; border-right: 0; } }
  </style>
</head>
<body>
  <div id="app"></div>
  <div class="RuntimeMessage" data-preview-message>Extension activated in an isolated preview.</div>
  <script>
    const showError = (error) => {
      const app = document.querySelector('#app')
      app.className = 'RuntimeError'
      app.textContent = error && (error.stack || error.message) || String(error)
      document.body.dataset.previewError = 'true'
    }
    addEventListener('error', (event) => showError(event.error || event.message))
    addEventListener('unhandledrejection', (event) => showError(event.reason))
  </script>
  <script type="module">${safeJavascript}\nawait globalThis.__renderExtensionSample()</script>
</body>
</html>`
}

const compile = async (source: string): Promise<string> => {
  await compilerReady
  const result = await esbuild.build({
    bundle: true,
    format: 'esm',
    plugins: [
      {
        name: 'lvce-extension-api-preview',
        setup(build): void {
          build.onResolve({ filter: /^@lvce-editor\/api$/ }, () => ({ namespace: 'lvce-api-preview', path: 'api' }))
          build.onLoad({ filter: /.*/, namespace: 'lvce-api-preview' }, () => ({ contents: previewApiSource, loader: 'js' }))
        },
      },
    ],
    stdin: {
      contents: source,
      loader: 'ts',
      resolveDir: '/',
      sourcefile: `${sampleId}/main.ts`,
    },
    target: 'es2022',
    write: false,
  })
  const output = result.outputFiles?.[0]
  if (!output) {
    throw new Error('The browser compiler did not produce JavaScript')
  }
  return output.text
}

const setPreview = (javascript: string): void => {
  if (state.previousPreviewUrl) {
    URL.revokeObjectURL(state.previousPreviewUrl)
  }
  state.previousPreviewUrl = URL.createObjectURL(new Blob([createPreviewDocument(javascript)], { type: 'text/html' }))
  preview.src = state.previousPreviewUrl
}

const saveAndRun = async (): Promise<void> => {
  const buildId = ++state.buildId
  status.dataset.state = 'building'
  status.textContent = 'Bundling TypeScript in the browser…'
  try {
    const javascript = await compile(editor.value)
    if (buildId !== state.buildId) {
      return
    }
    state.savedSource = editor.value
    localStorage.setItem(storageKey, state.savedSource)
    updateDirtyIndicator()
    setPreview(javascript)
    status.dataset.state = 'success'
    status.textContent = `Saved and rebuilt at ${new Date().toLocaleTimeString()}`
  } catch (error) {
    if (buildId !== state.buildId) {
      return
    }
    status.dataset.state = 'error'
    status.textContent = error instanceof Error ? error.message : String(error)
  }
}

const reset = async (): Promise<void> => {
  editor.value = state.originalSource
  localStorage.removeItem(storageKey)
  updateLineNumbers()
  updateDirtyIndicator()
  await saveAndRun()
}

const populateSamplePicker = async (): Promise<void> => {
  const response = await fetch(`${routePrefix}/samples.json`)
  const samples = (await response.json()) as readonly Sample[]
  for (const sample of samples) {
    const option = document.createElement('option')
    option.value = sample.route
    option.textContent = sample.title
    option.selected = sample.id === sampleId
    samplePicker.append(option)
  }
}

const load = async (): Promise<void> => {
  const response = await fetch(sourceUrl)
  if (!response.ok) {
    throw new Error(`Failed to load sample source: ${response.status}`)
  }
  state.originalSource = await response.text()
  state.savedSource = localStorage.getItem(storageKey) || state.originalSource
  editor.value = state.savedSource
  updateLineNumbers()
  updateDirtyIndicator()
  await Promise.all([populateSamplePicker(), saveAndRun()])
}

editor.addEventListener('input', () => {
  updateLineNumbers()
  updateDirtyIndicator()
})
editor.addEventListener('scroll', () => {
  lineNumbers.scrollTop = editor.scrollTop
})
editor.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    void saveAndRun()
  }
  if (event.key === 'Tab') {
    event.preventDefault()
    const start = editor.selectionStart
    editor.setRangeText('  ', start, editor.selectionEnd, 'end')
    updateLineNumbers()
    updateDirtyIndicator()
  }
})
samplePicker.addEventListener('change', () => {
  location.assign(`${routePrefix}/${samplePicker.value}/`)
})
getElement<HTMLButtonElement>('#save-button').addEventListener('click', () => void saveAndRun())
getElement<HTMLButtonElement>('#reset-button').addEventListener('click', () => void reset())

try {
  await load()
} catch (error) {
  status.dataset.state = 'error'
  status.textContent = error instanceof Error ? error.message : String(error)
}
