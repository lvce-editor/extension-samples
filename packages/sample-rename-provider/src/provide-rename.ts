interface TextDocument {
  readonly text: string
  readonly uri: string
}

interface RenameResult {
  readonly canRename: boolean
  readonly edits: readonly {
    readonly uri: string
    readonly edits: readonly { readonly offset: number; readonly deleted: number; readonly inserted: string }[]
  }[]
}

// The sample language has no scopes, strings, or comments: identifiers match across the document.
export const provideRename = (document: TextDocument, offset: number, newName: string): RenameResult => {
  const words = document.text.matchAll(/\b[a-zA-Z_]\w*\b/g).toArray()
  const word = words.find((match) => offset >= match.index && offset < match.index + match[0].length)?.[0]
  if (!word || word === 'let' || word === 'print' || !/^[a-zA-Z_]\w*$/.test(newName) || newName === 'let' || newName === 'print') {
    return { canRename: false, edits: [] }
  }
  return {
    canRename: true,
    edits: [
      {
        // Edits use offsets from the original document, including when the name changes length.
        edits: words.filter((match) => match[0] === word).map((match) => ({ deleted: word.length, inserted: newName, offset: match.index })),
        uri: document.uri,
      },
    ],
  }
}
