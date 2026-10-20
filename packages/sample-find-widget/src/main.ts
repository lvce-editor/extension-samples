import { activate, executeCommand, getWorkspaceUri, openUri, registerCommand } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  registerCommand({
    async execute() {
      const root = await getWorkspaceUri()
      await openUri(`${root}/example.txt`)
      await executeCommand('Editor.openFind')
      const editorUid = await executeCommand('GetActiveEditor.getActiveEditorId')
      // Script input updates the visible value as well as the search results.
      const scriptInput = 2
      await executeCommand('Viewlet.executeViewletCommand', editorUid, 'FindWidget.handleInput', 'matching phrase', scriptInput)
    },
    id: 'sample.findPhrase',
  })
}

main().catch(console.error)
