import { activate as activateExtensionApi, registerSourceControlProvider, type SourceControlProvider } from '@lvce-editor/api'

const providerId = 'sampleSourceControl'
const changedFiles = [
  { file: '/workspace/README.md', status: 1 },
  { file: '/workspace/src/main.ts', status: 2 },
]

const provider: SourceControlProvider = {
  acceptInput(value) {
    changedFiles.length = 0
    return `Committed: ${value}`
  },
  add(path) {
    return `Staged ${path}`
  },
  discard(path) {
    const index = changedFiles.findIndex(({ file }) => file === path)
    if (index !== -1) {
      changedFiles.splice(index, 1)
    }
    return `Discarded ${path}`
  },
  generateCommitMessage() {
    return 'feat: update extension sample'
  },
  getBadgeCount() {
    return changedFiles.length
  },
  getChangedFiles() {
    return changedFiles
  },
  getFeatures() {
    return {
      showGenerateCommitMessageButton: true,
    }
  },
  getFileBefore(uri) {
    return `Previous content for ${uri}`
  },
  getFileDecorations(uris) {
    return uris.map((uri) => ({ badge: 'M', uri }))
  },
  getGroups(cwd) {
    return [
      {
        id: 'changes',
        items: changedFiles.map((item) => ({ ...item, file: `${cwd}${item.file.slice('/workspace'.length)}` })),
        label: 'Changes',
      },
    ]
  },
  id: providerId,
  isActive(scheme, root) {
    return scheme === 'file' && root === '/workspace'
  },
}

await activateExtensionApi()
registerSourceControlProvider(provider)
