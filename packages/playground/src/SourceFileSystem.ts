import {
  activate,
  executeCommand,
  mkdir,
  readDirWithFileTypes,
  readFile,
  registerCommand,
  registerFileSystemProvider,
  remove,
  writeFile,
} from '@lvce-editor/api'
import { readGeneratedBundle } from './GeneratedBundleStorage.ts'

const prefix = 'sample-source://'
const memoryUri = (uri: string): string => uri.replace(prefix, 'memfs://')
const generatedRoot = 'sample-source:///sample/dist'
const isGenerated = (uri: string): boolean => uri === generatedRoot || uri.startsWith(`${generatedRoot}/`)

const assertWritable = (uri: string): void => {
  if (isGenerated(uri) || uri === 'sample-source:///sample') throw new Error('Generated files are read-only')
}

const main = async (): Promise<void> => {
  let generatedUrl = new URL('../samples/' + new URL(import.meta.url).searchParams.get('sample') + '/dist/main.js', import.meta.url).href
  await activate()
  registerCommand({
    execute(url: string) {
      generatedUrl = url
    },
    id: 'sampleSource.setGeneratedUrl',
  })
  registerFileSystemProvider({
    id: 'sample-source',
    async mkdir(uri) {
      assertWritable(uri)
      await mkdir(memoryUri(uri))
    },
    async readDirWithFileTypes(uri) {
      if (uri === generatedRoot) return [{ name: 'main.js', type: 7 }]
      if (isGenerated(uri)) throw new Error(`Not a directory: ${uri}`)
      const entries = await readDirWithFileTypes(memoryUri(uri))
      return uri === 'sample-source:///sample' ? [...entries.filter((entry) => entry.name !== 'dist'), { name: 'dist', type: 3 }] : entries
    },
    async readFile(uri) {
      if (!isGenerated(uri)) return readFile(memoryUri(uri))
      if (uri !== `${generatedRoot}/main.js`) throw new Error(`File not found: ${uri}`)
      const response = await readGeneratedBundle(generatedUrl)
      if (!response.ok) throw new Error(`Unable to load generated output: ${response.status}`)
      return response.text()
    },
    async remove(uri) {
      assertWritable(uri)
      await remove(memoryUri(uri))
    },
    async rename(oldUri, newUri) {
      assertWritable(oldUri)
      assertWritable(newUri)
      // Use the application filesystem command to preserve directory renames too.
      await executeCommand('FileSystem.rename', memoryUri(oldUri), memoryUri(newUri))
    },
    async writeFile(uri, content) {
      assertWritable(uri)
      await writeFile(memoryUri(uri), content)
    },
  })
}

await main()
