import type { HoverProvider } from '@lvce-editor/api'

type TextDocument = Pick<Parameters<HoverProvider['provideHover']>[0], 'text' | 'uri'>

interface RenameResult {
  readonly canRename: boolean
  readonly edits: readonly {
    readonly uri: string
    readonly edits: readonly { readonly offset: number; readonly deleted: number; readonly inserted: string }[]
  }[]
}

const identifierPattern = /\b[a-zA-Z_]\w*\b/g
const validNamePattern = /^[a-zA-Z_]\w*$/

const getRenameWord = (document: TextDocument, offset: number): RegExpExecArray | undefined => {
  const match = document.text.matchAll(identifierPattern).find((word) => offset >= word.index && offset < word.index + word[0].length)
  return match && match[0] !== 'let' && match[0] !== 'print' ? match : undefined
}

export const prepareRename = (document: TextDocument, offset: number): { readonly placeholder: string } | undefined => {
  const word = getRenameWord(document, offset)
  return word ? { placeholder: word[0] } : undefined
}

// The sample language has no scopes, strings, or comments: identifiers match across the document.
export const provideRename = (document: TextDocument, offset: number, newName: string): RenameResult => {
  const words = document.text.matchAll(identifierPattern).toArray()
  const word = getRenameWord(document, offset)?.[0]
  if (!word || !validNamePattern.test(newName) || newName === 'let' || newName === 'print') {
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
