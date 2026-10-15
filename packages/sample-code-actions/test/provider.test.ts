import { expect, test } from '@jest/globals'
import { organizeImports } from '../src/organize-imports.ts'

test('organize imports preserves the body and line endings and becomes a no-op', () => {
  const body = '\r\nprint(apple)\r\n'
  const text = 'import zebra\r\nimport apple\r\n' + body
  const edits = organizeImports({ text })
  expect(edits).toEqual([{ endOffset: text.length - body.length, inserted: 'import apple\r\nimport zebra\r\n', startOffset: 0 }])
  expect(organizeImports({ text: 'import apple\r\nimport zebra\r\n' + body })).toEqual([])
  expect(organizeImports({ text: 'print(apple)\n' })).toEqual([])
  expect(organizeImports({ text: 'import zebra\nimport apple' })).toEqual([{ endOffset: 25, inserted: 'import apple\nimport zebra', startOffset: 0 }])
})
