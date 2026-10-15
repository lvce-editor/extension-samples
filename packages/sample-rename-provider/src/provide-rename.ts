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

const getRenameWord = (document: TextDocument, offset: number) => {
  const match = document.text.matchAll(/\b[a-zA-Z_]\w*\b/g).find((word) => offset >= word.index && offset < word.index + word[0].length)
  return match && match[0] !== 'let' && match[0] !== 'print' ? match : undefined
}

export const prepareRename = (document: TextDocument, offset: number): { readonly placeholder: string } | undefined => {
  const word = getRenameWord(document, offset)
  return word ? { placeholder: word[0] } : undefined
}

// The sample language has no scopes, strings, or comments: identifiers match across the document.
export const provideRename = (document: TextDocument, offset: number, newName: string): RenameResult => {
  const words = document.text.matchAll(/\b[a-zA-Z_]\w*\b/g).toArray()
  const word = getRenameWord(document, offset)?.[0]
  if (!word || !/^[a-zA-Z_]\w*$/.test(newName) || newName === 'let' || newName === 'print') {
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
