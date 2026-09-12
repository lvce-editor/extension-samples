interface TextDocument {
  readonly text: string
  readonly uri: string
}

// This tiny language has document-wide variables declared with `let name = value`.
export const provideDefinition = (document: TextDocument, offset: number): { endOffset: number; startOffset: number; uri: string } | undefined => {
  const word = document.text.matchAll(/\b[a-zA-Z_]\w*\b/g).find((match) => offset >= match.index && offset < match.index + match[0].length)?.[0]
  if (!word) return undefined
  for (const match of document.text.matchAll(/^let ([a-zA-Z_]\w*)\s*=/gm)) {
    if (match[1] === word) {
      const startOffset = match.index + 'let '.length
      return { endOffset: startOffset + word.length, startOffset, uri: document.uri }
    }
  }
  return undefined
}
