import { activate, registerFormattingProvider } from '@lvce-editor/api'

await activate()
registerFormattingProvider({
  format(document) {
    const formatted = document.text
      .split('\n')
      .map((line) => line.trim().replace(/^([^=]+?)\s*=\s*(.*)$/, '$1 = $2'))
      .join('\n')
    if (formatted === document.text) return []
    return [{ endOffset: document.text.length, inserted: formatted, startOffset: 0 }]
  },
  id: 'sample-formatting',
  languageId: 'sample-settings',
})
