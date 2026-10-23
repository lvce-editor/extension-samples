import { activate, executeCommand, registerSelectionProvider, registerCommand } from '@lvce-editor/api'

interface TextDocument {
  readonly text: string
}

const main = async (): Promise<void> => {
  await activate()
  registerSelectionProvider({
    id: 'sample-selections',
    languageId: 'plaintext',
    provideSelections({ text }: TextDocument, selections: readonly number[]) {
      const lines = text.split('\n')
      const expanded: number[] = []
      for (let i = 0; i < selections.length; i += 4) {
        const row = selections[i] ?? 0
        expanded.push(row, 0, row, lines[row]?.length ?? 0)
      }
      return expanded
    },
  })
  registerCommand({
    id: 'sample.expandSelection',
    // eslint-disable-next-line perfectionist/sort-objects -- sample API command IDs precede their handlers
    async execute() {
      await executeCommand('Editor.selectionGrow')
    },
  })
}

main().catch(console.error)
