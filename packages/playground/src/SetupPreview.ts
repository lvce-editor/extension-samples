type Execute = (command: string, ...args: readonly unknown[]) => Promise<unknown>

interface PreviewContext {
  readonly openFile: (path: string) => Promise<unknown>
  readonly openPanel: (name: string) => Promise<unknown>
  readonly openSideBar: (name: string) => Promise<unknown>
  readonly setCursor: (line: number, column: number) => Promise<unknown>
  readonly showCompletions: () => Promise<unknown>
  readonly showHover: () => Promise<unknown>
  readonly showStatusBar: () => Promise<unknown>
}

export const setupPreview = async (source: string | undefined, workspace: string, execute: Execute): Promise<void> => {
  if (source === undefined) return
  const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }))
  try {
    const module = await import(url)
    if (typeof module.setupPreview !== 'function') throw new Error('Export a setupPreview function from .lvce/setup-preview.js')
    const context: PreviewContext = {
      openFile: (path) => execute('Main.openUri', `${workspace.replace(/\/$/, '')}/${path.replace(/^\//, '')}`),
      openPanel: (name) => execute('Layout.showPanel', name),
      openSideBar: (name) => execute('Layout.openSideBarViewlet', name),
      setCursor: (line, column) => execute('Editor.cursorSet', line, column),
      showCompletions: () => execute('Editor.openCompletion'),
      showHover: () => execute('Editor.showHover'),
      showStatusBar: () => execute('Layout.showStatusBar'),
    }
    await module.setupPreview(context)
  } catch (error) {
    throw new Error(`Preview setup failed: ${String(error)}`, { cause: error })
  } finally {
    URL.revokeObjectURL(url)
  }
}
