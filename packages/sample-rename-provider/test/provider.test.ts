import { deepStrictEqual, equal } from 'node:assert/strict'
import { test } from 'node:test'
import { provideRename } from '../src/provide-rename.ts'

test('rename uses original offsets for a longer replacement without matching identifier prefixes', () => {
  const document = { text: 'let color = blue\nlet colorful = green\nprint(color)\nprint(color)', uri: 'memfs:///example.sample' }
  const result = provideRename(document, 5, 'backgroundColor')
  equal(result.canRename, true)
  const changes = result.edits[0]
  equal(changes?.uri, document.uri)
  let text = document.text
  for (const edit of [...(changes?.edits ?? [])].sort((a, b) => b.offset - a.offset)) {
    text = text.slice(0, edit.offset) + edit.inserted + text.slice(edit.offset + edit.deleted)
  }
  equal(text, 'let backgroundColor = blue\nlet colorful = green\nprint(backgroundColor)\nprint(backgroundColor)')
  for (const name of ['', 'two words', '1color', 'let', 'print']) {
    deepStrictEqual(provideRename(document, 5, name), { canRename: false, edits: [] })
  }
  deepStrictEqual(provideRename(document, 0, 'shade'), { canRename: false, edits: [] })
})
