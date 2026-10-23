import { activate, registerCommand, showNotification } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  registerCommand({
    id: 'sample.helloWorld',
    async execute() {
      await showNotification('info', 'Hello World!')
    },
  })
}

main()
