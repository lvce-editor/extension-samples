import { activate, registerFormattingProvider } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  registerFormattingProvider({
    format(document) {
      const formatted = document.text
        .split('\n')
        .map((line) => {
          const trimmed = line.trim()
          const equals = trimmed.indexOf('=')
          if (equals <= 0) return trimmed
          return `${trimmed.slice(0, equals).trimEnd()} = ${trimmed.slice(equals + 1).trimStart()}`
        })
        .join('\n')
      if (formatted === document.text) return []
      return [{ endOffset: document.text.length, inserted: formatted, startOffset: 0 }]
    },
    id: 'sample-formatting',
    languageId: 'plaintext',
  })
}

main().catch(console.error)
