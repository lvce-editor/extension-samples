import { activate, registerCommand, showDialog } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  registerCommand({
    id: 'sample.showErrorDialog',
    // eslint-disable-next-line perfectionist/sort-objects -- sample API command IDs precede their handlers
    async execute() {
      await showDialog({
        confirmMessage: 'OK',
        message: 'This is a sample error dialog. No files have been changed.',
        title: 'Example Error',
        type: 'error',
      })
    },
  })
}

main()
