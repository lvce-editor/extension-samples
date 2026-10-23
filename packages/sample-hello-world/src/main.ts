import { activate, registerCommand, showNotification } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  registerCommand({
    id: 'sample.helloWorld',
    // eslint-disable-next-line perfectionist/sort-objects -- sample API command IDs precede their handlers
    async execute() {
      await showNotification('info', 'Hello World!')
    },
  })
}

main()
