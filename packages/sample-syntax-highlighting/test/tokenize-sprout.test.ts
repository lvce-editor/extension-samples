import { expect, test } from '@jest/globals'
import { initialLineState, tokenizeLine, TokenType } from '../src/tokenizeSprout.js'

test('strings and comments keep keyword and numeric text inside their own tokens', () => {
  expect(tokenizeLine('"let 42" // print 3', initialLineState)).toEqual({
    state: 1,
    tokens: [TokenType.String, 8, TokenType.None, 1, TokenType.Comment, 10],
  })
})

test('keyword boundaries preserve ordinary names and account for the whole line', () => {
  expect(tokenizeLine('letter = 12.5', initialLineState)).toEqual({
    state: 1,
    tokens: [TokenType.None, 7, TokenType.Punctuation, 1, TokenType.None, 1, TokenType.Number, 4],
  })
  expect(tokenizeLine('', initialLineState)).toEqual({ state: 1, tokens: [] })
})
