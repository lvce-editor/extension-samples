interface TextDocument {
  readonly text: string
  readonly uri: string
}

const identifierPattern = /\b[a-zA-Z_]\w*\b/g
const declarationPattern = /^let ([a-zA-Z_]\w*)\s*=/gm

// This tiny language has document-wide variables declared with `let name = value`.
export const provideDefinition = (document: TextDocument, offset: number): { endOffset: number; startOffset: number; uri: string } | undefined => {
  const word = document.text.matchAll(identifierPattern).find((match) => offset >= match.index && offset < match.index + match[0].length)?.[0]
  if (!word) return undefined
  for (const match of document.text.matchAll(declarationPattern)) {
    if (match[1] === word) {
      const startOffset = match.index + 'let '.length
      return { endOffset: startOffset + word.length, startOffset, uri: document.uri }
    }
  }
  return undefined
}
