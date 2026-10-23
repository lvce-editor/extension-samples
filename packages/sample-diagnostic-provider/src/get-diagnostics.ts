import type { Diagnostic } from '@lvce-editor/api'

const todoMarker = /\bTODO\b/g

export const getDiagnostics = (text: string): Diagnostic[] => {
  const diagnostics: Diagnostic[] = []
  for (const [rowIndex, line] of text.split('\n').entries()) {
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
}
