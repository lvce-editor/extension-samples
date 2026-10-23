import type { FileSystemProvider } from '@lvce-editor/api'
import { createFsFromVolume, Volume } from 'memfs'
import { instructions } from './instructions.ts'

const sampleMemfsScheme = /^sample-memfs:\/\//
const getPath = (uri: string): string => {
  const path = uri.replace(sampleMemfsScheme, '')
  return path.startsWith('/') ? path : `/${path}`
}

const initialFiles = {
  '/README.md': `# Hello from memfs\n\n${instructions}`,
  '/src/example.ts': "export const greeting = 'Hello from an extension file system'",
}

export const createFileSystemProvider = (): FileSystemProvider => {
  const memfs = createFsFromVolume(Volume.fromJSON(initialFiles))

  return {
    id: 'sample-memfs',
    mkdir(uri): void {
      memfs.mkdirSync(getPath(uri), { recursive: true })
    },
    readDirWithFileTypes(uri): Array<{ name: string; type: number }> {
      const entries = memfs.readdirSync(getPath(uri), { withFileTypes: true }) as unknown as Array<{ name: string; isDirectory: () => boolean }>
      return entries.map((entry) => ({
        name: entry.name,
        type: entry.isDirectory() ? 3 : 7,
      }))
    },
    readFile(uri): string {
      return memfs.readFileSync(getPath(uri), 'utf8').toString()
    },
    remove(uri): void {
      memfs.rmSync(getPath(uri), { recursive: true })
    },
    rename(oldUri, newUri): void {
      memfs.renameSync(getPath(oldUri), getPath(newUri))
    },
    writeFile(uri, content): void {
      memfs.writeFileSync(getPath(uri), content)
    },
  }
}
