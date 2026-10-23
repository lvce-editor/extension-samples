import { activate, registerCommand, registerStatusBarItemProvider } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  let count = 0
  const statusBar = registerStatusBarItemProvider({
    getStatusBarItem() {
      return {
        ariaLabel: `Counter: ${count}`,
        name: 'sample.incrementStatusBarCounter',
        onClick: 'sample.incrementStatusBarCounter',
        text: `Count: ${count}`,
        title: 'Click to increment the counter',
      }
    },
    id: 'sample-counter',
  })
  registerCommand({
    execute() {},
    id: 'sample.initializeStatusBarCounter',
  })
  registerCommand({
    async execute() {
      count++
      await statusBar.refresh()
    },
    id: 'sample.incrementStatusBarCounter',
  })
}

main()
