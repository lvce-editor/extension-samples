import { expect, test } from '@jest/globals'
import { provideTypeDefinition } from '../src/provide-type-definition.ts'

test('type definition resolves the annotated type after declarations move', () => {
  const document = {
    text: '\ntype Colorful = string\ntype Color = string\nlet color: Color = blue\nprint(color)\nprint(missing)',
    uri: 'memfs:///example.txt',
  }
  const startOffset = document.text.indexOf('Color =')
  expect(provideTypeDefinition(document, document.text.lastIndexOf('color') + 2)).toEqual({
    endOffset: startOffset + 5,
    startOffset,
    uri: document.uri,
  })
  expect(provideTypeDefinition(document, document.text.indexOf('missing'))).toBeUndefined()
  expect(provideTypeDefinition(document, document.text.indexOf('print'))).toBeUndefined()
  expect(provideTypeDefinition(document, 0)).toBeUndefined()
  expect(provideTypeDefinition({ ...document, text: 'let color: Unknown = blue' }, 5)).toBeUndefined()
})
