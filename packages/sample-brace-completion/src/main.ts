import { activate, executeCommand, registerBraceCompletionProvider, registerCommand } from '@lvce-editor/api'

interface TextDocument {
  readonly text: string
}

const braces = new Set(['(', '[', '{'])

const main = async (): Promise<void> => {
  await activate()
  registerBraceCompletionProvider({
    id: 'sample-braces',
    languageId: 'plaintext',
    provideBraceCompletion(_document: TextDocument, _offset: number, text: string) {
      return braces.has(text)
    },
  })
  registerCommand({
    id: 'sample.completeBrace',
    // eslint-disable-next-line perfectionist/sort-objects -- sample API command IDs precede their handlers
    async execute() {
      await executeCommand('Editor.braceCompletion', '(')
    },
  })
}

main().catch(console.error)
