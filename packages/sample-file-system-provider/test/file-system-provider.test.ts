import { expect, test } from '@jest/globals'
import { createFileSystemProvider } from '../src/file-system-provider.ts'

const missingPathError = /ENOENT/

test('reads and lists the initial files', () => {
  const provider = createFileSystemProvider()

  expect(provider.readFile('sample-memfs:///README.md')).toContain('# Hello from memfs')
  expect(provider.readDirWithFileTypes?.('sample-memfs:///')).toEqual([
    { name: 'README.md', type: 7 },
    { name: 'src', type: 3 },
  ])
  expect(provider.readDirWithFileTypes?.('sample-memfs:///src')).toEqual([{ name: 'example.ts', type: 7 }])
})

test('creates directories, writes files, renames them, and removes them', async () => {
  const provider = createFileSystemProvider()

  await provider.mkdir?.('sample-memfs:///empty/nested')
  expect(provider.readDirWithFileTypes?.('sample-memfs:///empty')).toEqual([{ name: 'nested', type: 3 }])
  expect(provider.readDirWithFileTypes?.('sample-memfs:///empty/nested')).toEqual([])

  await provider.writeFile?.('sample-memfs:///empty/nested/file.txt', 'memfs content')
  await provider.rename?.('sample-memfs:///empty/nested/file.txt', 'sample-memfs:///empty/nested/renamed.txt')
  expect(provider.readFile('sample-memfs:///empty/nested/renamed.txt')).toBe('memfs content')

  await provider.rename?.('sample-memfs:///empty', 'sample-memfs:///moved')
  expect(provider.readDirWithFileTypes?.('sample-memfs:///moved/nested')).toEqual([{ name: 'renamed.txt', type: 7 }])

  await provider.remove?.('sample-memfs:///moved')
  expect(() => provider.readDirWithFileTypes?.('sample-memfs:///moved')).toThrow(missingPathError)
})

test('reports missing files with memfs errors', () => {
  const provider = createFileSystemProvider()

  expect(() => provider.readFile('sample-memfs:///missing.txt')).toThrow(missingPathError)
})
