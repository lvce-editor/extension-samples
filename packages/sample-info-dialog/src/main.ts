import { activate, executeCommand, registerCommand } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  registerCommand({
    async execute() {
      await executeCommand('Dialog.show', {
        confirmMessage: 'OK',
        message: 'This is a sample information dialog. No files have been changed.',
        title: 'Example Information',
        type: 'info',
      })
    },
    id: 'sample.showInformationDialog',
  })
}

main()
