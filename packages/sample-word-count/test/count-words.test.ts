import { expect, test } from '@jest/globals'
import { countWords } from '../src/count-words.ts'

test('countWords returns zero for empty and whitespace-only text', () => {
  expect(countWords('')).toBe(0)
  expect(countWords(' \t\n  ')).toBe(0)
})

test('countWords counts whitespace-separated words across lines', () => {
  expect(countWords('one two\nthree\tfour')).toBe(4)
})
