import { activate as activateExtensionApi, registerSourceControlProvider, type SourceControlProvider } from '@lvce-editor/api'

const providerId = 'source-control-provider'
const workspaceRoot = '/extension-samples/source-control-provider'
const changedFiles = [
  { file: `${workspaceRoot}/README.md`, icon: 0, iconTitle: 'Modified', status: 1 },
  { file: `${workspaceRoot}/src/main.ts`, icon: 0, iconTitle: 'Modified', status: 2 },
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
        items: changedFiles.map((item) => ({ ...item, file: `${cwd}${item.file.slice(workspaceRoot.length)}` })),
        label: 'Changes',
      },
    ]
  },
  id: providerId,
  isActive(_scheme, _root) {
    return true
  },
}

const main = async (): Promise<void> => {
  await activateExtensionApi()
  registerSourceControlProvider(provider)
}

main().catch(console.error)
