import { activate, registerCommand, showDialog } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  registerCommand({
    async execute() {
      await showDialog({
        confirmMessage: 'OK',
        message: 'This is a sample error dialog. No files have been changed.',
        title: 'Example Error',
        type: 'error',
      })
    },
    id: 'sample.showErrorDialog',
  })
}

main()
