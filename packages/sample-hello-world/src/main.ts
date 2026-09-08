import { activate, registerCommand, showNotification } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  registerCommand({
    async execute() {
      await showNotification('info', 'Hello World!')
    },
    id: 'sample.helloWorld',
  })
}

main().catch(console.error)
