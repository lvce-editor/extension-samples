import { expect, test } from '@jest/globals'
import { prepareRename, provideRename } from '../src/provide-rename.ts'

test('rename uses original offsets for a longer replacement without matching identifier prefixes', () => {
  const document = { text: 'let color = blue\nlet colorful = green\nprint(color)\nprint(color)', uri: 'memfs:///example.sample' }
  const result = provideRename(document, 5, 'backgroundColor')
  expect(result.canRename).toBe(true)
  const changes = result.edits[0]
  if (!changes) throw new Error('Expected a renamed document')
  expect(changes.uri).toBe(document.uri)
  let { text } = document
  const edits = changes.edits.toSorted((a, b) => b.offset - a.offset)
  for (const edit of edits) {
    text = text.slice(0, edit.offset) + edit.inserted + text.slice(edit.offset + edit.deleted)
  }
  expect(text).toBe('let backgroundColor = blue\nlet colorful = green\nprint(backgroundColor)\nprint(backgroundColor)')
  for (const name of ['', 'two words', '1color', 'let', 'print']) {
    expect(provideRename(document, 5, name)).toEqual({ canRename: false, edits: [] })
  }
  expect(provideRename(document, 0, 'shade')).toEqual({ canRename: false, edits: [] })
})

test('rename is offered only on identifiers that the provider can rename', () => {
  const document = { text: 'let color = blue', uri: 'memfs:///example.txt' }
  expect(prepareRename(document, 5)).toEqual({ endOffset: 9, placeholder: 'color', startOffset: 4 })
  expect(prepareRename(document, 0)).toBeUndefined()
  expect(prepareRename(document, 3)).toBeUndefined()
})
