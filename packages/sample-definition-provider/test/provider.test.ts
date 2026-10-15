import { expect, test } from '@jest/globals'
import { provideDefinition } from '../src/provide-definition.ts'

test('definition computes the declaration offset after the document changes', () => {
  const document = { text: '\nlet colorful = red\nlet color = blue\nprint(color)', uri: 'memfs:///example.sample' }
  const startOffset = document.text.indexOf('color =')
  expect(provideDefinition(document, document.text.lastIndexOf('color') + 2)).toEqual({ endOffset: startOffset + 5, startOffset, uri: document.uri })
  expect(provideDefinition(document, document.text.indexOf('print'))).toBeUndefined()
  expect(provideDefinition(document, 0)).toBeUndefined()
  expect(provideDefinition(document, document.text.indexOf('blue'))).toBeUndefined()
  expect(provideDefinition(document, document.text.length)).toBeUndefined()
})

test('references include declarations and exact identifier uses with current offsets', async () => {
  const { provideReferences } = await import('../src/provide-references.ts')
  const document = { text: 'let color = blue\r\nlet colorful = green\r\nprint(color)\r\nprint(color)', uri: 'memfs:///example.txt' }
  const references = provideReferences(document, 5)
  expect(references.map((reference) => reference.startRowIndex)).toEqual([0, 2, 3])
  for (const reference of references) {
    expect(document.text.slice(reference.startOffset, reference.endOffset)).toBe('color')
    expect(reference.uri).toBe(document.uri)
    expect(reference.endColumnIndex - reference.startColumnIndex).toBe(5)
  }
  expect(provideReferences(document, document.text.length - 3)).toEqual(references)
  expect(provideReferences(document, 0)).toEqual([])
  expect(provideReferences({ ...document, text: 'print(missing)' }, 8)).toEqual([])
})
