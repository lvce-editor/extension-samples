interface TextDocument {
  readonly text: string
  readonly uri: string
}

const identifierPattern = /\b[a-zA-Z_]\w*\b/g
const variablePattern = /^let ([a-zA-Z_]\w*): ([a-zA-Z_]\w*)\s*=/gm
const typePattern = /^type ([a-zA-Z_]\w*)\s*=/gm

// Variables have document-wide type annotations: `let color: Color = blue`.
export const provideTypeDefinition = (
  document: TextDocument,
  offset: number,
): { endOffset: number; startOffset: number; uri: string } | undefined => {
  const word = document.text.matchAll(identifierPattern).find((match) => offset >= match.index && offset < match.index + match[0].length)?.[0]
  if (!word) return undefined
  const typeName = document.text.matchAll(variablePattern).find((match) => match[1] === word)?.[2]
  if (!typeName) return undefined
  for (const match of document.text.matchAll(typePattern)) {
    if (match[1] === typeName) {
      const startOffset = match.index + 'type '.length
      return { endOffset: startOffset + typeName.length, startOffset, uri: document.uri }
    }
  }
  return undefined
}
