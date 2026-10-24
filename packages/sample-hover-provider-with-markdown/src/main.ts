import { activate, registerHoverProvider } from '@lvce-editor/api'

const documentation: Record<string, string> = {
  blue: 'Markdown supports **bold**, `inline code`, and lists:\n\n- First item\n- Second item',
}
const words = /\b[a-z]+\b/g

const main = async (): Promise<void> => {
  await activate()
  registerHoverProvider({
    id: 'sample-hover-with-markdown',
    languageId: 'plaintext',
    provideHover(document, offset) {
      for (const match of document.text.matchAll(words)) {
        if (offset >= match.index && offset < match.index + match[0].length) {
          const text = documentation[match[0]]
          return text ? { documentation: text } : undefined
        }
      }
      return undefined
    },
  })
}

main()
