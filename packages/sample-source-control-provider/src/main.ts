import { activate as activateExtensionApi, registerCommand, registerSourceControlProvider, type SourceControlProvider } from '@lvce-editor/api'
import { Volume } from 'memfs'
import initialFiles from './initial-files.json' with { type: 'json' }

const providerId = 'source-control-provider'
const workspaceRoot = '/extension-samples/source-control-provider'
const volume = Volume.fromJSON(initialFiles)
const changedFiles = Object.keys(volume.toJSON()).map((path) => ({
  file: `${workspaceRoot}${path}`,
  icon: 0,
  iconTitle: 'Modified',
  status: 1,
}))

const discardFile = (path: string): string => {
  const index = changedFiles.findIndex(({ file }) => path.endsWith(file.slice(workspaceRoot.length)))
  if (index !== -1) {
    changedFiles.splice(index, 1)
  }
  return `Discarded ${path}`
}

const provider: SourceControlProvider = {
  acceptInput(value) {
    changedFiles.length = 0
    return `Committed: ${value}`
  },
  add(path) {
    return `Staged ${path}`
  },
  discard: discardFile,
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
  registerCommand({
    id: 'sampleSourceControl.discard',
    execute: discardFile,
  })
}

main()
