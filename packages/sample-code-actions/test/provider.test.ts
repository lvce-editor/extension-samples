import { deepStrictEqual } from 'node:assert/strict'
import { test } from 'node:test'
import { organizeImports } from '../src/organize-imports.ts'

test('organize imports preserves the body and line endings and becomes a no-op', () => {
  const body = '\r\nprint(apple)\r\n'
  const text = 'import zebra\r\nimport apple\r\n' + body
  const edits = organizeImports({ text })
  deepStrictEqual(edits, [{ endOffset: text.length - body.length, inserted: 'import apple\r\nimport zebra\r\n', startOffset: 0 }])
  deepStrictEqual(organizeImports({ text: 'import apple\r\nimport zebra\r\n' + body }), [])
  deepStrictEqual(organizeImports({ text: 'print(apple)\n' }), [])
  deepStrictEqual(organizeImports({ text: 'import zebra\nimport apple' }), [
    { endOffset: 25, inserted: 'import apple\nimport zebra', startOffset: 0 },
  ])
})
