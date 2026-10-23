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
    async execute() {
      await executeCommand('Editor.braceCompletion', '(')
    },
  })
}

main().catch(console.error)
