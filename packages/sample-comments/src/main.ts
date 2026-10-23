import { activate, executeCommand, registerCommentProvider, registerCommand } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  registerCommentProvider({
    id: 'sample-comments',
    languageId: 'plaintext',
    provideComment() {
      return ['/*', '*/']
    },
  })
  registerCommand({
    async execute() {
      await executeCommand('Editor.toggleBlockComment')
    },
    id: 'sample.commentSelection',
  })
}

main().catch(console.error)
