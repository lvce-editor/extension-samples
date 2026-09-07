import { activate, registerCompletionProvider } from '@lvce-editor/api'

const colors = ['blue', 'green', 'red']

await activate()
registerCompletionProvider({
  id: 'sample-completions',
  languageId: 'plaintext',
  provideCompletions(document, offset) {
    let start = offset
    while (start > 0 && /[a-z]/i.test(document.text[start - 1])) start--
    const prefix = document.text.slice(start, offset).toLowerCase()
    return colors.filter((color) => color.startsWith(prefix)).map((color) => ({ label: color, type: 1 }))
  },
})
