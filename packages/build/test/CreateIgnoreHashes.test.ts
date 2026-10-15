import { webcrypto } from 'node:crypto'
import { expect, test } from '@jest/globals'
import { createIgnoreHashes } from '../src/CreateIgnoreHashes.ts'

test('hashes exact shipped text with the same SHA-256 encoding as the extension', async () => {
  const texts = ['hello', 'hello\n', 'hello\r\n', 'café 🌍', '']
  const files = Object.fromEntries(texts.map((text, index) => [`/src/${index}.ts`, text]))
  const expected = await Promise.all(
    texts.map(async (text) => Buffer.from(await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(text))).toString('hex')),
  )
  expect(createIgnoreHashes(files)).toEqual(expected.sort())
  expect(createIgnoreHashes({ '/a.ts': 'hello', '/b.ts': 'hello' })).toEqual(['2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'])
  expect(createIgnoreHashes({})).toEqual([])
})
