import { activate, registerDiagnosticProvider, type Diagnostic } from '@lvce-editor/api'

const todoMarker = /\bTODO\b/g

const main = async (): Promise<void> => {
  await activate()
  registerDiagnosticProvider({
    id: 'sample-diagnostics',
    languageId: 'plaintext',
    provideDiagnostics(document) {
      const diagnostics: Diagnostic[] = []
      for (const [rowIndex, line] of document.text.split('\n').entries()) {
        for (const match of line.matchAll(todoMarker)) {
          diagnostics.push({
            columnIndex: match.index,
            endColumnIndex: match.index + match[0].length,
            endRowIndex: rowIndex,
            message: 'Replace TODO with a setting value.',
            rowIndex,
            source: 'sample-diagnostics',
            type: 'error',
          })
        }
      }
      return diagnostics
    },
  })
}

main()
