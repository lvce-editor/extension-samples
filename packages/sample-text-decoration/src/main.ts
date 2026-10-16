import {
  activate,
  refreshEditorTextDecorations,
  registerCommand,
  registerEditorTextDecorationProvider,
  type EditorTextDecoration,
} from '@lvce-editor/api'
import { mapEditorTextDecorations } from './map-decorations.ts'

const todoPattern = /\bTODO\b:?/g
const keywordPattern = /\b(?:const|let|function)\b/g
const flowPattern = /\b(?:return|await)\b/g
const repeatedPattern = /\b(\w+)(\s+)(\1)\b/gi

const main = async (): Promise<void> => {
  await activate()
  let isAddSelection = false
  let activeExample: 'todo' | 'keywords' | 'repeated' | undefined
  const documents = new Map<string, { text: string; decorations: readonly EditorTextDecoration[] }>()
  const findDecorations = (text: string, expression: RegExp, color: string): EditorTextDecoration[] => {
    const decorations: EditorTextDecoration[] = []
    for (const [rowIndex, line] of text.split('\n').entries()) {
      expression.lastIndex = 0
      for (const match of line.matchAll(expression)) {
        const startColumnIndex = match.index
        decorations.push({
          color,
          endColumnIndex: startColumnIndex + match[0].length,
          endRowIndex: rowIndex,
          startColumnIndex,
          startRowIndex: rowIndex,
          thickness: 2,
        })
      }
    }
    return decorations
  }
  const getRepeatedDecorations = (text: string): EditorTextDecoration[] =>
    text.split('\n').flatMap((line, rowIndex) => {
      const repeated: EditorTextDecoration[] = []
      for (const match of line.matchAll(repeatedPattern)) {
        const repeatedWord = match[1] || ''
        const startColumnIndex = match.index + match[0].lastIndexOf(repeatedWord)
        repeated.push({
          color: '#d49b16',
          endColumnIndex: startColumnIndex + repeatedWord.length,
          endRowIndex: rowIndex,
          startColumnIndex,
          startRowIndex: rowIndex,
          thickness: 2,
        })
      }
      return repeated
    })
  const registration = registerEditorTextDecorationProvider({
    id: 'sample.underlines',
    provideEditorTextDecorations(document) {
      const previous = documents.get(document.uri)
      let decorations: readonly EditorTextDecoration[] = []
      switch (activeExample) {
        case 'keywords': {
          decorations = [...findDecorations(document.text, keywordPattern, '#8b5cf6'), ...findDecorations(document.text, flowPattern, '#168b78')]
          break
        }
        case 'repeated': {
          decorations = getRepeatedDecorations(document.text)
          break
        }
        case 'todo': {
          decorations = findDecorations(document.text, todoPattern, '#e05a33')
          break
        }
        default: {
          if (previous) decorations = mapEditorTextDecorations(previous.text, document.text, previous.decorations)
        }
      }
      if (isAddSelection) {
        isAddSelection = false
        const selected = document.selections.filter(
          (range) => range.startRowIndex !== range.endRowIndex || range.startColumnIndex !== range.endColumnIndex,
        )
        const additions = selected.map((range) => ({ ...range, color: '#ff0000', thickness: 2 }))
        // Repeating the command on the same range does not accumulate duplicates.
        decorations = new Map(
          [...decorations, ...additions].map((item) => [
            [item.startRowIndex, item.startColumnIndex, item.endRowIndex, item.endColumnIndex].join(':'),
            item,
          ]),
        )
          .values()
          .toArray()
      }
      documents.set(document.uri, { decorations, text: document.text })
      return decorations
    },
  })
  registerCommand({
    async execute() {
      activeExample = undefined
      isAddSelection = true
      try {
        await refreshEditorTextDecorations()
      } finally {
        isAddSelection = false
      }
    },
    id: 'sample.underlineSelection',
  })
  const registerExample = (id: string, example: 'todo' | 'keywords' | 'repeated'): void => {
    registerCommand({
      async execute() {
        activeExample = example
        await refreshEditorTextDecorations()
      },
      id,
    })
  }
  registerExample('sample.highlightTodos', 'todo')
  registerExample('sample.colorKeywords', 'keywords')
  registerExample('sample.findRepeatedWords', 'repeated')
  registerCommand({
    async execute() {
      activeExample = undefined
      documents.clear()
      await refreshEditorTextDecorations()
    },
    id: 'sample.clearUnderlines',
  })
  registerCommand({
    async execute() {
      registration.dispose()
      documents.clear()
      await refreshEditorTextDecorations()
    },
    id: 'sample.disposeUnderlines',
  })
}

main()
