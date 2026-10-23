import { activate, executeCommand, registerTabCompletionProvider, registerCommand } from '@lvce-editor/api'

interface TextDocument {
  readonly text: string
}

const main = async (): Promise<void> => {
  await activate()
  registerTabCompletionProvider({
    id: 'sample-log-snippet',
    languageId: 'plaintext',
    provideTabCompletion({ text }: TextDocument, offset: number) {
      return text.slice(0, offset).endsWith('log') ? { deleted: 3, inserted: 'console.log($0)', type: 1 } : undefined
    },
  })
  registerCommand({
    async execute() {
      await executeCommand('Editor.tabCompletion')
    },
    id: 'sample.completeLog',
  })
}

main().catch(console.error)
