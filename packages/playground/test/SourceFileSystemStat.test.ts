import { expect, test } from '@jest/globals'
import { getSourceFileStat, modulesRoot } from '../src/SourceFileSystemStat.ts'

const unavailable = async (): Promise<number> => {
  throw new Error('unexpected memory filesystem lookup')
}

test('sample-source stat delegates ordinary paths to memfs', async () => {
  let invokedUri = ''

  const result = await getSourceFileStat('sample-source:///sample/src/main.ts', async (uri) => {
    invokedUri = uri
    return 7
  })

  expect(result).toBe(7)
  expect(invokedUri).toBe('memfs:///sample/src/main.ts')
})

test('sample-source stat reports generated and executable paths without loading them', async () => {
  await expect(getSourceFileStat('sample-source:///sample/dist', unavailable)).resolves.toBe(3)
  await expect(getSourceFileStat('sample-source:///sample/dist/main.js', unavailable)).resolves.toBe(7)
  await expect(getSourceFileStat(`${modulesRoot}/esbuild/bin`, unavailable)).resolves.toBe(3)
  await expect(getSourceFileStat(`${modulesRoot}/esbuild/bin/esbuild`, unavailable)).resolves.toBe(7)
  await expect(getSourceFileStat(`${modulesRoot}/.bin/esbuild`, unavailable)).resolves.toBe(7)
})

test('sample-source stat rejects missing synthetic paths', async () => {
  await expect(getSourceFileStat('sample-source:///sample/dist/other.js', unavailable)).rejects.toThrow(
    'File not found: sample-source:///sample/dist/other.js',
  )
  await expect(getSourceFileStat(`${modulesRoot}/.bin/other`, unavailable)).rejects.toThrow(`File not found: ${modulesRoot}/.bin/other`)
})
