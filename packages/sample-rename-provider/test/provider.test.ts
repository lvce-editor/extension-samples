import { test } from '@jest/globals'
import { deepStrictEqual, equal } from 'node:assert/strict'
import { prepareRename, provideRename } from '../src/provide-rename.ts'

test('rename uses original offsets for a longer replacement without matching identifier prefixes', () => {
  const document = { text: 'let color = blue\nlet colorful = green\nprint(color)\nprint(color)', uri: 'memfs:///example.sample' }
  const result = provideRename(document, 5, 'backgroundColor')
  equal(result.canRename, true)
  const changes = result.edits[0]
  equal(changes?.uri, document.uri)
  let { text } = document
  const edits = changes.edits.toSorted((a, b) => b.offset - a.offset)
  for (const edit of edits) {
    text = text.slice(0, edit.offset) + edit.inserted + text.slice(edit.offset + edit.deleted)
  }
  equal(text, 'let backgroundColor = blue\nlet colorful = green\nprint(backgroundColor)\nprint(backgroundColor)')
  for (const name of ['', 'two words', '1color', 'let', 'print']) {
    deepStrictEqual(provideRename(document, 5, name), { canRename: false, edits: [] })
  }
  deepStrictEqual(provideRename(document, 0, 'shade'), { canRename: false, edits: [] })
})

test('prepare rename accepts complete identifiers and rejects keywords or positions outside them', () => {
  const document = { text: 'let color = blue\nprint(colorful)', uri: 'memfs:///example.sample' }
  deepStrictEqual(prepareRename(document, 5), { placeholder: 'color' })
  deepStrictEqual(prepareRename(document, 23), { placeholder: 'colorful' })
  for (const offset of [-1, 0, 3, 9, 17, document.text.length]) {
    equal(prepareRename(document, offset), undefined)
  }
})
