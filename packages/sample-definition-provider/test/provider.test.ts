import { deepStrictEqual, equal } from 'node:assert/strict'
import { test } from 'node:test'
import { provideDefinition } from '../src/provide-definition.ts'

test('definition computes the declaration offset after the document changes', () => {
  const document = { text: '\nlet colorful = red\nlet color = blue\nprint(color)', uri: 'memfs:///example.sample' }
  const startOffset = document.text.indexOf('color =')
  deepStrictEqual(provideDefinition(document, document.text.lastIndexOf('color') + 2), { endOffset: startOffset + 5, startOffset, uri: document.uri })
  equal(provideDefinition(document, document.text.indexOf('print')), undefined)
  equal(provideDefinition(document, 0), undefined)
})
