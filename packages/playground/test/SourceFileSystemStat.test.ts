import { expect, test } from '@jest/globals'
import { getSourceFileStat, modulesRoot } from '../src/SourceFileSystemStat.ts'

test('sample-source stat delegates ordinary paths to memfs', async () => {
  let invokedUri = ''
  const expected = { exists: true, type: 7 }

  const result = await getSourceFileStat('sample-source:///sample/src/main.ts', async (uri) => {
    invokedUri = uri
    return expected
  })

  expect(result).toEqual(expected)
  expect(invokedUri).toBe('memfs:///sample/src/main.ts')
})

test('sample-source stat reports generated and executable paths without loading them', async () => {
  const unavailable = async (): Promise<never> => {
    throw new Error('unexpected memory filesystem lookup')
  }

  await expect(getSourceFileStat('sample-source:///sample/dist', unavailable)).resolves.toEqual({ exists: true, type: 3 })
  await expect(getSourceFileStat('sample-source:///sample/dist/main.js', unavailable)).resolves.toEqual({ exists: true, type: 7 })
  await expect(getSourceFileStat(`${modulesRoot}/esbuild/bin`, unavailable)).resolves.toEqual({ exists: true, type: 3 })
  await expect(getSourceFileStat(`${modulesRoot}/esbuild/bin/esbuild`, unavailable)).resolves.toEqual({ exists: true, type: 7 })
  await expect(getSourceFileStat(`${modulesRoot}/.bin/esbuild`, unavailable)).resolves.toEqual({ exists: true, type: 7 })
})

test('sample-source stat reports missing synthetic paths consistently', async () => {
  const unavailable = async (): Promise<never> => {
    throw new Error('unexpected memory filesystem lookup')
  }

  await expect(getSourceFileStat('sample-source:///sample/dist/other.js', unavailable)).resolves.toEqual({ exists: false, size: 0 })
  await expect(getSourceFileStat(`${modulesRoot}/.bin/other`, unavailable)).resolves.toEqual({ exists: false, size: 0 })
})
