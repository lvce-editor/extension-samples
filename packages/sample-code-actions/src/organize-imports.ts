interface TextDocument {
  readonly text: string
}

const importBlockPattern = /^(?:import [a-zA-Z_]\w*(?:\r?\n|$))+/
const newlinePattern = /\r?\n/

// In this sample language, imports are `import name` lines at the start of the document.
export const organizeImports = (document: TextDocument): readonly { startOffset: number; endOffset: number; inserted: string }[] => {
  const block = importBlockPattern.exec(document.text)?.[0]
  if (!block) return []
  const newline = block.includes('\r\n') ? '\r\n' : '\n'
  const imports = block.trimEnd().split(newlinePattern)
  const inserted = imports.toSorted((a, b) => a.localeCompare(b)).join(newline) + (block.endsWith('\n') ? newline : '')
  if (inserted === block) return []
  return [{ endOffset: block.length, inserted, startOffset: 0 }]
}
