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

const getRepeatedDecorations = (text: string): EditorTextDecoration[] => {
  const decorations: EditorTextDecoration[] = []
  for (const [rowIndex, line] of text.split('\n').entries()) {
    for (const match of line.matchAll(repeatedPattern)) {
      const repeatedWord = match[1] || ''
      const startColumnIndex = match.index + match[0].lastIndexOf(repeatedWord)
      decorations.push({
        color: '#d49b16',
        endColumnIndex: startColumnIndex + repeatedWord.length,
        endRowIndex: rowIndex,
        startColumnIndex,
        startRowIndex: rowIndex,
        thickness: 2,
      })
    }
  }
  return decorations
}

const getSelectionDecorations = (
  document: Parameters<NonNullable<Parameters<typeof registerEditorTextDecorationProvider>[0]['provideEditorTextDecorations']>>[0],
): EditorTextDecoration[] => {
  const decorations: EditorTextDecoration[] = []
  for (const range of document.selections) {
    if (range.startRowIndex === range.endRowIndex && range.startColumnIndex === range.endColumnIndex) continue
    decorations.push({ ...range, color: '#ff0000', thickness: 2 })
  }
  return decorations
}

type Example = 'todo' | 'keywords' | 'repeated'
type Document = Parameters<NonNullable<Parameters<typeof registerEditorTextDecorationProvider>[0]['provideEditorTextDecorations']>>[0]

const mergeDecorations = (decorations: readonly EditorTextDecoration[], additions: readonly EditorTextDecoration[]): EditorTextDecoration[] => {
  const unique = new Map<string, EditorTextDecoration>()
  for (const decoration of [...decorations, ...additions]) {
    const key = [decoration.startRowIndex, decoration.startColumnIndex, decoration.endRowIndex, decoration.endColumnIndex].join(':')
    unique.set(key, decoration)
  }
  return unique.values().toArray()
}

class TextDecorationSample {
  private isAddSelection = false
  private activeExample: Example | undefined = 'todo'
  private readonly documents = new Map<string, { text: string; decorations: readonly EditorTextDecoration[] }>()
  private registration: ReturnType<typeof registerEditorTextDecorationProvider> | undefined

  private provideEditorTextDecorations(document: Document): readonly EditorTextDecoration[] {
    const previous = this.documents.get(document.uri)
    let decorations: readonly EditorTextDecoration[] = []
    switch (this.activeExample) {
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
    if (this.isAddSelection) {
      this.isAddSelection = false
      decorations = mergeDecorations(decorations, getSelectionDecorations(document))
    }
    this.documents.set(document.uri, { decorations, text: document.text })
    return decorations
  }

  private async underlineSelection(): Promise<void> {
    this.activeExample = undefined
    this.isAddSelection = true
    try {
      await refreshEditorTextDecorations()
    } finally {
      this.isAddSelection = false
    }
  }

  private registerExample(id: string, example: Example): void {
    registerCommand({
      execute: this.selectExample.bind(this, example),
      id,
    })
  }

  private async selectExample(example: Example): Promise<void> {
    this.activeExample = example
    await refreshEditorTextDecorations()
  }

  private async clearUnderlines(): Promise<void> {
    this.activeExample = undefined
    this.documents.clear()
    await refreshEditorTextDecorations()
  }

  private async disposeUnderlines(): Promise<void> {
    this.registration?.dispose()
    this.documents.clear()
    await refreshEditorTextDecorations()
  }

  public register(): void {
    this.registration = registerEditorTextDecorationProvider({
      id: 'sample.underlines',
      provideEditorTextDecorations: this.provideEditorTextDecorations.bind(this),
    })
    registerCommand({
      execute: this.underlineSelection.bind(this),
      id: 'sample.underlineSelection',
    })
    this.registerExample('sample.highlightTodos', 'todo')
    this.registerExample('sample.colorKeywords', 'keywords')
    this.registerExample('sample.findRepeatedWords', 'repeated')
    registerCommand({
      execute: this.clearUnderlines.bind(this),
      id: 'sample.clearUnderlines',
    })
    registerCommand({
      execute: this.disposeUnderlines.bind(this),
      id: 'sample.disposeUnderlines',
    })
  }
}

const main = async (): Promise<void> => {
  await activate()
  const sample = new TextDecorationSample()
  sample.register()
}

main()
