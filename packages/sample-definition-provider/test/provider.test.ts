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
