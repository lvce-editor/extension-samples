import {
  activate,
  executeCommand,
  mkdir,
  readDirWithFileTypes,
  readFile,
  registerCommand,
  registerFileSystemProvider,
  remove,
  stat,
  writeFile,
} from '@lvce-editor/api'
import { readGeneratedBundle } from './GeneratedBundleStorage.ts'
import { binaryDirectories, generatedRoot, getSourceFileStat, isBinary, isGenerated, modulesRoot } from './SourceFileSystemStat.ts'

const prefix = 'sample-source://'
const memoryUri = (uri: string): string => uri.replace(prefix, 'memfs://')
const assertWritable = (uri: string): void => {
  if (isGenerated(uri) || uri === 'sample-source:///sample') throw new Error('Generated files are read-only')
  if (binaryDirectories.some((directory) => directory === uri || directory.startsWith(`${uri}/`) || uri.startsWith(`${directory}/`)))
    throw new Error('Installed binaries are read-only')
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
      if (binaryDirectories.includes(uri)) return [{ name: 'esbuild', type: 7 }]
      if (binaryDirectories.some((directory) => uri.startsWith(`${directory}/`))) throw new Error(`Not a directory: ${uri}`)
      const entries = await readDirWithFileTypes(memoryUri(uri))
      if (uri === modulesRoot) return [...entries.filter((entry) => entry.name !== '.bin'), { name: '.bin', type: 3 }]
      if (uri === `${modulesRoot}/esbuild`) return [...entries.filter((entry) => entry.name !== 'bin'), { name: 'bin', type: 3 }]
      return uri === 'sample-source:///sample' ? [...entries.filter((entry) => entry.name !== 'dist'), { name: 'dist', type: 3 }] : entries
    },
    async readFile(uri) {
      if (isBinary(uri)) {
        const response = await fetch(new URL('../esbuild-bin', import.meta.url))
        if (!response.ok) throw new Error(`Unable to load esbuild binary: ${response.status}`)
        const bytes = new Uint8Array(await response.arrayBuffer())
        // Application filesystem reads are text-only, even when a provider returns a Blob.
        // Windows installs may retain the text CLI shim; Unix installs use a native binary.
        try {
          if (bytes.includes(0)) throw new Error('Binary content')
          return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
        } catch {
          throw new Error('The esbuild executable is a binary file and cannot be opened as text')
        }
      }
      if (binaryDirectories.includes(uri)) throw new Error(`Not a file: ${uri}`)
      if (!isGenerated(uri)) return readFile(memoryUri(uri))
      if (uri !== `${generatedRoot}/main.js`) throw new Error(`File not found: ${uri}`)
      const response = await readGeneratedBundle(generatedUrl)
      if (!response.ok) throw new Error(`Unable to load generated output: ${response.status}`)
      return response.text()
    },
    async stat(uri) {
      return getSourceFileStat(uri, (memoryUri) => stat(memoryUri))
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
