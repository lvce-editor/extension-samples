import { registerFileSystemProvider, registerSourceControlProvider, type FileSystemProvider, type SourceControlProvider } from '@lvce-editor/api'

const fileSystemProviders = new Map<string, FileSystemProvider>()
const state: { sourceControlProvider: SourceControlProvider | undefined } = {
  sourceControlProvider: undefined,
}

const getFileSystemProvider = (id: string): FileSystemProvider => {
  const provider = fileSystemProviders.get(id)
  if (!provider) {
    throw new Error(`File system provider ${id} is still loading`)
  }
  return provider
}

const createFileSystemRouter = (id: string): FileSystemProvider => ({
  id,
  isReadonly: () => getFileSystemProvider(id).isReadonly?.() ?? false,
  mkdir: (uri) => getFileSystemProvider(id).mkdir?.(uri),
  readDirWithFileTypes: (uri) => getFileSystemProvider(id).readDirWithFileTypes?.(uri) ?? [],
  readFile: (uri) => getFileSystemProvider(id).readFile(uri),
  remove: (uri) => getFileSystemProvider(id).remove?.(uri),
  rename: (oldUri, newUri) => getFileSystemProvider(id).rename?.(oldUri, newUri),
  writeFile: (uri, content) => getFileSystemProvider(id).writeFile?.(uri, content),
})

const sourceControlRouter: SourceControlProvider = {
  acceptInput: (value) => state.sourceControlProvider?.acceptInput?.(value),
  add: (path) => state.sourceControlProvider?.add?.(path),
  discard: (path) => state.sourceControlProvider?.discard?.(path),
  generateCommitMessage: () => state.sourceControlProvider?.generateCommitMessage?.(),
  getBadgeCount: () => state.sourceControlProvider?.getBadgeCount?.() ?? 0,
  getChangedFiles: () => state.sourceControlProvider?.getChangedFiles() ?? [],
  getFeatures: () => state.sourceControlProvider?.getFeatures?.() ?? {},
  getFileBefore: (uri) => state.sourceControlProvider?.getFileBefore?.(uri),
  getFileBeforeUri: (uri) => state.sourceControlProvider?.getFileBeforeUri?.(uri) ?? 'data://',
  getFileDecorations: (uris) => state.sourceControlProvider?.getFileDecorations?.(uris) ?? [],
  getGroups: (cwd) => state.sourceControlProvider?.getGroups?.(cwd) ?? [],
  id: 'sampleSourceControl',
  isActive: (scheme, root) => state.sourceControlProvider?.isActive?.(scheme, root) ?? false,
}

export const registerProviderRouters = (): void => {
  registerFileSystemProvider(createFileSystemRouter('sample-memfs'))
  registerSourceControlProvider(sourceControlRouter)
}

export const setFileSystemProvider = (provider: FileSystemProvider): void => {
  fileSystemProviders.set(provider.id, provider)
}

export const setSourceControlProvider = (provider: SourceControlProvider): void => {
  state.sourceControlProvider = provider
}
