import { activate, registerCommand, registerStatusBarItemProvider, showQuickPick } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  let environment = 'Development'
  const ready = activate().then(() =>
    registerStatusBarItemProvider({
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
    }),
  )
  registerCommand({
    async execute() {
      await ready
    },
    id: 'sample.initializeStatusBar',
  })
  registerCommand({
    async execute() {
      const statusBar = await ready
      const value = await showQuickPick({
        items: ['Development', 'Staging', 'Production'].map((label) => ({ description: `Use ${label.toLowerCase()} settings`, label, value: label })),
        placeholder: 'Choose an environment',
      })
      // Cancelling leaves the current environment unchanged.
      if (typeof value !== 'string') return
      environment = value
      await statusBar.refresh()
    },
    id: 'sample.selectEnvironment',
  })
  await ready
}

main().catch(console.error)
