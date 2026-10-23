import { activate, registerCommand, registerStatusBarItemProvider } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  let count = 0
  const statusBar = registerStatusBarItemProvider({
    getStatusBarItem() {
      return {
        ariaLabel: `Counter: ${String(count)}`,
        name: 'sample.incrementStatusBarCounter',
        onClick: 'sample.incrementStatusBarCounter',
        text: `Count: ${String(count)}`,
        title: 'Click to increment the counter',
      }
    },
    id: 'sample-counter',
  })
  registerCommand({
    id: 'sample.initializeStatusBarCounter',
    execute() {},
  })
  registerCommand({
    id: 'sample.incrementStatusBarCounter',
    async execute() {
      count++
      await statusBar.refresh()
    },
  })
}

main()
