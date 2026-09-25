import assert from 'node:assert/strict'
import test from 'node:test'
import { countWords } from '../src/count-words.ts'

void test('countWords returns zero for empty and whitespace-only text', () => {
  assert.equal(countWords(''), 0)
  assert.equal(countWords(' \t\n  '), 0)
})

void test('countWords counts whitespace-separated words across lines', () => {
  assert.equal(countWords('one two\nthree\tfour'), 4)
})
