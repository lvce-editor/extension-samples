import type { DocumentSymbol, DocumentSymbolTextDocument } from '@lvce-editor/api'

const declaration = /^([a-zA-Z]\w*)=/gm

export const provideDocumentSymbols = ({ text }: DocumentSymbolTextDocument): readonly DocumentSymbol[] => {
  return Array.from(text.matchAll(declaration), (match) => ({
    endOffset: match.index + match[0].length,
    kind: 13,
    name: match[1] ?? '',
    selectionEndOffset: match.index + (match[1]?.length ?? 0),
    selectionStartOffset: match.index,
    startOffset: match.index,
  }))
}
