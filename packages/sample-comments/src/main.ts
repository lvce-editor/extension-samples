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
    id: 'sample.commentSelection',
    async execute() {
      await executeCommand('Editor.toggleBlockComment')
    },
  })
}

main().catch(console.error)
