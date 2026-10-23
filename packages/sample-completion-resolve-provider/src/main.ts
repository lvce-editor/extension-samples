import { activate, registerCompletionProvider } from '@lvce-editor/api'

const colors = ['blue', 'green', 'red']
const letters = /[a-z]/i
const resolvedValues: Record<string, string> = {
  blue: '#0000ff',
  green: '#008000',
  red: '#ff0000',
}

const main = async (): Promise<void> => {
  await activate()
  registerCompletionProvider({
    id: 'sample-completion-resolve',
    languageId: 'plaintext',
    provideCompletions(document, offset) {
      let start = offset
      while (start > 0 && letters.test(document.text.charAt(start - 1))) start--
      const prefix = document.text.slice(start, offset).toLowerCase()
      return colors.filter((color) => color.startsWith(prefix)).map((color) => ({ label: color, type: 1 }))
    },
    resolveCompletionItem(document, offset, name, completionItem) {
      const color = resolvedValues[name]
      return color ? { ...completionItem, snippet: color } : undefined
    },
  })
}

main()
