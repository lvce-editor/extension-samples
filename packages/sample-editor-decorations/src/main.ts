import {
  activate,
  registerEditorGutterDecorationProvider,
  registerEditorLineDecorationProvider,
  type EditorGutterDecorationType,
} from '@lvce-editor/api'

const markerTypes: Readonly<Record<string, EditorGutterDecorationType>> = { '-': 'deleted', '+': 'added', '~': 'modified' }

const main = async (): Promise<void> => {
  await activate()
  registerEditorGutterDecorationProvider({
    id: 'sample-marker-gutter',
    provideEditorGutterDecorations({ languageId, text }) {
      if (languageId !== 'plaintext') return []
      return text.split('\n').flatMap((line, rowIndex) => {
        const type = markerTypes[line[0] ?? '']
        return type ? [{ rowIndex, type }] : []
      })
    },
  })
  registerEditorLineDecorationProvider({
    id: 'sample-marker-label',
    provideEditorLineDecoration({ languageId, text }, rowIndex) {
      if (languageId !== 'plaintext') return undefined
      const line = text.split('\n')[rowIndex] ?? ''
      const type = markerTypes[line[0] ?? '']
      return type ? { text: ` — ${type}` } : undefined
    },
  })
}

main()
