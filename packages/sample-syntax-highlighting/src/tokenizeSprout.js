/** @public */
export const TokenType = {
  None: 0,
  Keyword: 1,
  String: 2,
  Number: 3,
  Comment: 4,
  Punctuation: 5,
}

/** @public */
export const TokenMap = {
  [TokenType.None]: 'None',
  [TokenType.Keyword]: 'Keyword',
  [TokenType.String]: 'String',
  [TokenType.Number]: 'Numeric',
  [TokenType.Comment]: 'Comment',
  [TokenType.Punctuation]: 'Punctuation',
}

/** @public */
export const initialLineState = { state: 1 }
/** @public */
export const hasArrayReturn = true

/** @public */
export const isLineStateEqual = (left, right) => left.state === right.state

const tokenPattern = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:let|print|true|false)\b|\b\d+(?:\.\d+)?\b|\/\/.*|[=(),])/y
const keywordPattern = /^(?:let|print|true|false)$/
const numberPattern = /^\d/

/** @public */
export const tokenizeLine = (line, lineState) => {
  const tokens = []
  let offset = 0
  while (offset < line.length) {
    tokenPattern.lastIndex = offset
    const match = tokenPattern.exec(line)
    if (!match) {
      const start = offset++
      while (offset < line.length) {
        tokenPattern.lastIndex = offset
        if (tokenPattern.test(line)) break
        offset++
      }
      tokens.push(TokenType.None, offset - start)
      continue
    }
    const value = match[0]
    let type = TokenType.Punctuation
    if (value.startsWith('//')) {
      type = TokenType.Comment
    } else if (value.startsWith('"') || value.startsWith("'")) {
      type = TokenType.String
    } else if (numberPattern.test(value)) {
      type = TokenType.Number
    } else if (keywordPattern.test(value)) {
      type = TokenType.Keyword
    }
    tokens.push(type, value.length)
    offset += value.length
    if (type === TokenType.Comment) break
  }
  return { state: lineState.state, tokens }
}
