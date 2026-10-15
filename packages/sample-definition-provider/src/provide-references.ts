import { provideDefinition } from './provide-definition.ts'

interface TextDocument {
  readonly text: string
  readonly uri: string
}

interface Reference {
  readonly endColumnIndex: number
  readonly endOffset: number
  readonly endRowIndex: number
  readonly lineText: string
  readonly startColumnIndex: number
  readonly startOffset: number
  readonly startRowIndex: number
  readonly uri: string
}

const identifierPattern = /\b[a-zA-Z_]\w*\b/g

export const provideReferences = (document: TextDocument, offset: number): readonly Reference[] => {
  const definition = provideDefinition(document, offset)
  if (!definition) return []
  const word = document.text.slice(definition.startOffset, definition.endOffset)
  const references: Reference[] = []
  let lineOffset = 0
  for (const [rowIndex, line] of document.text.split('\n').entries()) {
    for (const match of line.matchAll(identifierPattern)) {
      if (match[0] === word) {
        references.push({
          endColumnIndex: match.index + word.length,
          endOffset: lineOffset + match.index + word.length,
          endRowIndex: rowIndex,
          lineText: line,
          startColumnIndex: match.index,
          startOffset: lineOffset + match.index,
          startRowIndex: rowIndex,
          uri: document.uri,
        })
      }
    }
    lineOffset += line.length + 1
  }
  return references
}
