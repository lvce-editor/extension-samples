import { activate, executeCommand, registerCommand } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  registerCommand({
    async execute() {
      await executeCommand('Dialog.showWarning', {
        confirmMessage: 'OK',
        message: 'This is a sample warning dialog. No files have been changed.',
        title: 'Example Warning',
      })
    },
    id: 'sample.showWarningDialog',
  })
}

main().catch(console.error)
