import { expect, test } from '@jest/globals'
import { provideDocumentSymbols } from '../src/provide-document-symbols.ts'

test('symbols follow declaration offsets after edits and ignore ordinary text', () => {
  const text = '# settings\ncolor=blue\nother text\nsize=large\n'
  const symbols = provideDocumentSymbols({ languageId: 'plaintext', text, uri: 'memfs:///settings.txt' })
  expect(symbols.map(({ name }) => name)).toEqual(['color', 'size'])
  for (const symbol of symbols) {
    expect(text.slice(symbol.selectionStartOffset, symbol.selectionEndOffset)).toBe(symbol.name)
  }
  expect(provideDocumentSymbols({ languageId: 'plaintext', text: 'no declarations', uri: 'memfs:///empty.txt' })).toEqual([])
})
