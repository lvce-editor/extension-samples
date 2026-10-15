import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { activate, executeCommand, registerCommand, registerView, type ViewContext, type VirtualDomViewInstance } from '@lvce-editor/api'
import { VirtualDomElements } from '@lvce-editor/constants'
import { parseHtml } from './parse-html.ts'

const sampleViewId = 'sample.html-preview'
const sampleCommandId = 'sample.openHtmlPreview'
const previewDelay = 250

interface TextDocument {
  readonly text?: unknown
}

const getActiveText = async (): Promise<string | undefined> => {
  const document = (await executeCommand('GetActiveEditor.getTextDocument')) as TextDocument | undefined
  return document && typeof document.text === 'string' ? document.text : undefined
}

const renderError = (message: string): readonly VirtualDomNode[] => [
  { childCount: 1, className: 'HtmlPreviewError', role: 'alert', type: VirtualDomElements.Div },
  { childCount: 0, text: message, type: VirtualDomElements.Text },
]

const createPreview = async (context?: ViewContext): Promise<VirtualDomViewInstance> => {
  let text = (await getActiveText()) || ''
  let isDisposed = false
  let isPolling = false
  const poll = async (): Promise<void> => {
    if (isDisposed || isPolling) return
    isPolling = true
    try {
      const updatedText = await getActiveText()
      if (updatedText !== undefined && updatedText !== text) {
        text = updatedText
        await context?.requestRerender()
      }
    } finally {
      isPolling = false
    }
  }
  const interval = setInterval(() => {
    void poll()
  }, previewDelay)
  return {
    dispose(): void {
      isDisposed = true
      clearInterval(interval)
    },
    getCss(): string {
      return '.HtmlPreviewError { color: var(--vscode-errorForeground, #f14c4c); padding: 12px; }'
    },
    render(): readonly VirtualDomNode[] {
      const result = parseHtml(text)
      return result.error ? renderError(result.error) : result.dom
    },
  }
}

const main = async (): Promise<void> => {
  await activate()
  registerView({
    create: createPreview,
    id: sampleViewId,
    kind: 'virtualDom',
    preferredLocation: 'sideBar',
    title: 'HTML Preview',
  })
  registerCommand({
    async execute(): Promise<void> {
      await executeCommand('Layout.openSideBarViewlet', sampleViewId)
    },
    id: sampleCommandId,
  })
}

main()
