import { activate as activateExtensionApi, registerFileSystemProvider, type FileSystemProvider } from '@lvce-editor/api'
import { instructions } from './instructions.ts'

const files = new Map<string, string>([
  ['/README.md', `# Hello from memfs\n\n${instructions}`],
  ['/src/example.ts', "export const greeting = 'Hello from an extension file system'"],
])

const normalize = (uri: string): string => {
  const path = uri.replace(/^sample-memfs:\/\//, '')
  return path.startsWith('/') ? path : `/${path}`
}

const getDirectChildren = (directory: string): Array<{ name: string; type: number }> => {
  const prefix = directory === '/' ? '/' : `${directory}/`
  const children = new Map<string, number>()
  for (const file of files.keys()) {
    if (!file.startsWith(prefix)) {
      continue
    }
    const relative = file.slice(prefix.length)
    const [name, ...rest] = relative.split('/')
    if (name) {
      children.set(name, rest.length === 0 ? 7 : 3)
    }
  }
  return Array.from(children, ([name, type]) => ({ name, type }))
}

const provider: FileSystemProvider = {
  id: 'sample-memfs',
  mkdir(_uri: string) {},
  readDirWithFileTypes(uri) {
    return getDirectChildren(normalize(uri))
  },
  readFile(uri) {
    const path = normalize(uri)
    const content = files.get(path)
    if (content === undefined) {
      throw new Error(`File not found: ${path}`)
    }
    return content
  },
  remove(uri) {
    const path = normalize(uri)
    files.delete(path)
    for (const file of files.keys()) {
      if (file.startsWith(`${path}/`)) {
        files.delete(file)
      }
    }
  },
  rename(oldUri, newUri) {
    const oldPath = normalize(oldUri)
    const newPath = normalize(newUri)
    const content = files.get(oldPath)
    if (content !== undefined) {
      files.delete(oldPath)
      files.set(newPath, content)
    }
  },
  writeFile(uri, content) {
    files.set(normalize(uri), content)
  },
}

const main = async (): Promise<void> => {
  await activateExtensionApi()
  registerFileSystemProvider(provider)
}

main().catch(console.error)
