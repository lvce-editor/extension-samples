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

test('classifies keywords, both quote styles, punctuation, whitespace, and unsupported text', () => {
  expect(tokenizeLine('let print true false = () 42 \'text\' "more" !', initialLineState)).toEqual({
    state: 1,
    tokens: [
      TokenType.Keyword,
      3,
      TokenType.None,
      1,
      TokenType.Keyword,
      5,
      TokenType.None,
      1,
      TokenType.Keyword,
      4,
      TokenType.None,
      1,
      TokenType.Keyword,
      5,
      TokenType.None,
      1,
      TokenType.Punctuation,
      1,
      TokenType.None,
      1,
      TokenType.Punctuation,
      1,
      TokenType.Punctuation,
      1,
      TokenType.None,
      1,
      TokenType.Number,
      2,
      TokenType.None,
      1,
      TokenType.String,
      6,
      TokenType.None,
      1,
      TokenType.String,
      6,
      TokenType.None,
      2,
    ],
  })
  expect(tokenizeLine("'unterminated", initialLineState)).toEqual({
    state: 1,
    tokens: [TokenType.None, 13],
  })
})
