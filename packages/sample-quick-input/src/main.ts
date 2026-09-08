import { activate, executeCommand, getWorkspaceUri, registerCommand, showQuickInput, writeFile } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  registerCommand({
    async execute() {
      // Freeform text input accepts any name without a results list.
      const name = await showQuickInput({ placeholder: 'Who should we greet?', value: 'World' })
      // Cancellation and an empty name leave the workspace unchanged.
      if (name === undefined || !name.trim()) return
      const workspaceUri = await getWorkspaceUri()
      const uri = `${workspaceUri.replace(/\/$/, '')}/greeting.txt`
      await writeFile(uri, `Hello, ${name.trim()}!\n`)
      await executeCommand('Main.openUri', uri)
    },
    id: 'sample.createGreeting',
  })
}

main().catch(console.error)
