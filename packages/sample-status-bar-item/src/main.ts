import { activate, registerCommand, registerStatusBarItemProvider, showQuickPick } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  let environment = 'Development'
  const statusBar = registerStatusBarItemProvider({
    getStatusBarItem() {
      return {
        ariaLabel: `Environment: ${environment}`,
        name: 'sample.selectEnvironment',
        onClick: 'sample.selectEnvironment',
        text: `Environment: ${environment}`,
        title: 'Choose an environment',
      }
    },
    id: 'sample-environment',
  })
  registerCommand({
    async execute() {
      const value = await showQuickPick({
        items: ['Development', 'Staging', 'Production'].map((label) => ({ label, value: label })),
        placeholder: 'Choose an environment',
      })
      // Cancelling leaves the current environment unchanged.
      if (typeof value !== 'string') return
      environment = value
      await statusBar.refresh()
    },
    id: 'sample.selectEnvironment',
  })
}

main().catch(console.error)
