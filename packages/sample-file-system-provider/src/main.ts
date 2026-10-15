import { activate as activateExtensionApi, registerFileSystemProvider, type FileSystemProvider } from '@lvce-editor/api'
import { instructions } from './instructions.ts'

const sampleMemfsScheme = /^sample-memfs:\/\//

const fileStore: { contents: Record<string, string> } = { contents: Object.create(null) as Record<string, string> }
fileStore.contents['/README.md'] = `# Hello from memfs\n\n${instructions}`
fileStore.contents['/src/example.ts'] = "export const greeting = 'Hello from an extension file system'"

const removeFiles = (shouldRemove: (file: string) => boolean): void => {
  const remainingFiles = Object.create(null) as Record<string, string>
  for (const [file, content] of Object.entries(fileStore.contents)) {
    if (!shouldRemove(file)) {
      remainingFiles[file] = content
    }
  }
  fileStore.contents = remainingFiles
}

const normalize = (uri: string): string => {
  const path = uri.replace(sampleMemfsScheme, '')
  return path.startsWith('/') ? path : `/${path}`
}

const getDirectChildren = (directory: string): Array<{ name: string; type: number }> => {
  const prefix = directory === '/' ? '/' : `${directory}/`
  const children = Object.create(null) as Record<string, number>
  for (const file of Object.keys(fileStore.contents)) {
    if (!file.startsWith(prefix)) {
      continue
    }
    const relative = file.slice(prefix.length)
    const [name, ...rest] = relative.split('/')
    if (name) {
      children[name] = rest.length === 0 ? 7 : 3
    }
  }
  return Object.entries(children).map(([name, type]) => ({ name, type }))
}

const provider: FileSystemProvider = {
  id: 'sample-memfs',
  mkdir(_uri: string) {},
  readDirWithFileTypes(uri) {
    return getDirectChildren(normalize(uri))
  },
  readFile(uri) {
    const path = normalize(uri)
    const content = fileStore.contents[path]
    if (content === undefined) {
      throw new Error(`File not found: ${path}`)
    }
    return content
  },
  remove(uri) {
    const path = normalize(uri)
    removeFiles((file) => file === path || file.startsWith(`${path}/`))
  },
  rename(oldUri, newUri) {
    const oldPath = normalize(oldUri)
    const newPath = normalize(newUri)
    const content = fileStore.contents[oldPath]
    if (content !== undefined) {
      removeFiles((file) => file === oldPath)
      fileStore.contents[newPath] = content
    }
  },
  writeFile(uri, content) {
    fileStore.contents[normalize(uri)] = content
  },
}

const main = async (): Promise<void> => {
  await activateExtensionApi()
  registerFileSystemProvider(provider)
}

main()
