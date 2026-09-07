import { activate, registerCompletionProvider } from '@lvce-editor/api'

const colors = ['blue', 'green', 'red']

await activate()
registerCompletionProvider({
  id: 'sample-completions',
  languageId: 'sample-settings',
  provideCompletions(document, offset) {
    const prefix = /[a-z]*$/i.exec(document.text.slice(0, offset))?.[0] || ''
    return colors.filter((color) => color.startsWith(prefix)).map((color) => ({ label: color, type: 1 }))
  },
})
