import { activate, executeCommand, registerClosingTagProvider, registerCommand } from '@lvce-editor/api'

interface TextDocument {
  readonly text: string
}

const openTag = /<([a-z][a-z0-9]*)>[^<>]*<$/i

const main = async (): Promise<void> => {
  await activate()
  registerClosingTagProvider({
    id: 'sample-closing-tags',
    languageId: 'plaintext',
    provideClosingTag({ text }: TextDocument, offset: number, typed: string) {
      const tag = openTag.exec(text.slice(0, offset))?.[1]
      return typed === '/' && tag ? { inserted: `/${tag}>` } : undefined
    },
  })
  registerCommand({
    id: 'sample.closeTag',
    async execute() {
      await executeCommand('Editor.typeWithAutoClosing', '/')
    },
  })
}

main().catch(console.error)
