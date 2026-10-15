import { activate, registerCompletionProvider } from '@lvce-editor/api'

const colors = ['blue', 'green', 'red']
const letters = /[a-z]/i

const main = async (): Promise<void> => {
  await activate()
  registerCompletionProvider({
    id: 'sample-completions',
    languageId: 'plaintext',
    provideCompletions(document, offset) {
      let start = offset
      while (start > 0 && letters.test(document.text.charAt(start - 1))) start--
      const prefix = document.text.slice(start, offset).toLowerCase()
      return colors
        .filter((color) => color.startsWith(prefix))
        .map((color) => ({ label: color, replacementRange: { endOffset: offset, startOffset: start }, type: 1 }))
    },
  })
}

main()
