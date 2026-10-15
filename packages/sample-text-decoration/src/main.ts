import {
  activate,
  refreshEditorTextDecorations,
  registerCommand,
  registerEditorTextDecorationProvider,
  type EditorTextDecoration,
} from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  let isAddSelection = false
  const documents = new Map<string, { text: string; decorations: readonly EditorTextDecoration[] }>()
  const registration = registerEditorTextDecorationProvider({
    id: 'sample.underlines',
    provideEditorTextDecorations(document) {
      const previous = documents.get(document.uri)
      // Clear after edits instead of leaving underlines at stale positions.
      let decorations = previous?.text === document.text ? previous.decorations : []
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
      isAddSelection = true
      try {
        await refreshEditorTextDecorations()
      } finally {
        isAddSelection = false
      }
    },
    id: 'sample.underlineSelection',
  })
  registerCommand({
    async execute() {
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
