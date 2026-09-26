import { activate, executeCommand, registerCommand } from '@lvce-editor/api'

const insertText = async (): Promise<void> => {
  await executeCommand('Editor.type', 'Hello, World!')
}

const main = async (): Promise<void> => {
  await activate()
  registerCommand({
    execute: insertText,
    id: 'sample.insertText',
  })
}

main()
