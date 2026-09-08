import { activate, registerHoverProvider } from '@lvce-editor/api'

const documentation: Record<string, string> = {
  blue: 'Blue: the color of a clear sky.',
  green: 'Green: the color of fresh leaves.',
  red: 'Red: the color of ripe strawberries.',
}

await activate()
registerHoverProvider({
  id: 'sample-hover',
  languageId: 'plaintext',
  provideHover(document, offset) {
    for (const match of document.text.matchAll(/\b[a-z]+\b/g)) {
      if (offset >= match.index && offset < match.index + match[0].length) {
        const text = documentation[match[0]]
        return text ? { documentation: text } : undefined
      }
    }
    return undefined
  },
})
