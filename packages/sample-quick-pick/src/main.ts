import { activate, executeCommand, getWorkspaceUri, registerCommand, showQuickPick, writeFile } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  registerCommand({
    async execute() {
      const value = await showQuickPick({
        items: [
          { description: 'Run locally', icon: 'Color', label: 'Development', value: 'development' },
          { description: 'Test before shipping', icon: 'Color', label: 'Staging', value: 'staging' },
          { description: 'Serve real users', icon: 'Color', label: 'Production', value: 'production' },
        ],
        placeholder: 'Choose a deployment environment',
        type: 'select',
      })
      // Escape returns undefined: do not write a file when the picker is cancelled.
      if (typeof value !== 'string') return
      const workspaceUri = await getWorkspaceUri()
      const uri = `${workspaceUri.replace(/\/$/, '')}/environment.txt`
      await writeFile(uri, `Selected environment: ${value}\n`)
      await executeCommand('Main.openUri', uri)
    },
    id: 'sample.chooseEnvironment',
  })
}

main().catch(console.error)
