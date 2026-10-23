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
    // eslint-disable-next-line perfectionist/sort-objects -- sample API command IDs precede their handlers
    async execute() {
      await executeCommand('Editor.toggleBlockComment')
    },
  })
}

main().catch(console.error)
