import { expect, test } from '@jest/globals'
import { provideSignatureHelp } from '../src/provide-signature-help.ts'

test('parameter help tracks commas and ends after the closing parenthesis', () => {
  const document = { languageId: 'plaintext', text: 'mix(blue, green)', uri: 'memfs:///colors.txt' }
  expect(provideSignatureHelp(document, 5)).toMatchObject({ activeParameter: 0 })
  expect(provideSignatureHelp(document, 10)).toMatchObject({ activeParameter: 1 })
  expect(provideSignatureHelp(document, document.text.length)).toBeUndefined()
  expect(provideSignatureHelp({ ...document, text: 'other(blue' }, 10)).toBeUndefined()
})
