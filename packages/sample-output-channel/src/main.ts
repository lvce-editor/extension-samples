import {
  activate,
  createOutputChannel,
  getCacheStorageItem,
  getWorkspaceUri,
  openOutputView,
  preparePrettyError,
  registerCommand,
  registerFileChangeHandler,
  removeCacheStorageItem,
  setCacheStorageItem,
  writeFile,
} from '@lvce-editor/api'

const output = createOutputChannel('sample-build')

const main = async (): Promise<void> => {
  const ready = activate().then(() => output.appendLine('Ready. Run Sample: Run Build from the command palette.'))
  let build = 0
  let changeHandler: ReturnType<typeof registerFileChangeHandler> | undefined
  let fileRevision = 0
  const watchedUri = async (): Promise<string> => `${await getWorkspaceUri()}/watched.txt`
  registerCommand({
    async execute() {
      await ready
      build++
      await output.appendLine(`Build ${String(build)}: starting`)
      await output.append('Compiling example.sample... ')
      await output.appendLine('done')
      await output.appendLine('Build succeeded.')
      await openOutputView({ channel: 'sample-build' })
    },
    id: 'sample.runBuild',
  })
  registerCommand({
    async execute() {
      await ready
      await output.clear()
      await openOutputView({ channel: 'sample-build' })
    },
    id: 'sample.clearBuildOutput',
  })
  registerCommand({
    async execute() {
      await ready
      const key = 'https://extension-samples.invalid/build-artifact'
      try {
        const result = await setCacheStorageItem(key, new Blob(['Compiled sample artifact'], { type: 'text/plain' }))
        if (!result.success) throw new Error(result.errorMessage)
        const cached = await getCacheStorageItem(key)
        if (!cached) throw new Error('Cached artifact is missing')
        await output.appendLine(`Cached artifact: ${await cached.blob.text()}`)
      } finally {
        await removeCacheStorageItem(key)
      }
      await output.appendLine(`Artifact removed: ${String((await getCacheStorageItem(key)) === null)}`)
      await openOutputView({ channel: 'sample-build' })
    },
    id: 'sample.cacheBuildArtifact',
  })
  registerCommand({
    async execute() {
      await ready
      const uri = await watchedUri()
      changeHandler?.dispose()
      changeHandler = registerFileChangeHandler(async (changes) => {
        if (changes.changed?.includes(uri)) await output.appendLine('Changed watched.txt')
      })
      await output.appendLine('Watching watched.txt')
      await openOutputView({ channel: 'sample-build' })
    },
    id: 'sample.watchFileChanges',
  })
  registerCommand({
    async execute() {
      await ready
      fileRevision++
      await writeFile(await watchedUri(), `Revision ${String(fileRevision)}`)
      await output.appendLine(`Wrote watched.txt: ${String(fileRevision)}`)
      await openOutputView({ channel: 'sample-build' })
    },
    id: 'sample.writeWatchedFile',
  })
  registerCommand({
    async execute() {
      await ready
      changeHandler?.dispose()
      changeHandler = undefined
      await output.appendLine('Stopped watching watched.txt')
      await openOutputView({ channel: 'sample-build' })
    },
    id: 'sample.stopWatchingFileChanges',
  })
  registerCommand({
    async execute() {
      await ready
      const error = await preparePrettyError(new Error('Example build failure'))
      await output.appendLine(`Build error: ${error.message ?? 'Unknown error'}`)
      await openOutputView({ channel: 'sample-build' })
    },
    id: 'sample.reportBuildError',
  })
  await ready
}

main().catch(console.error)
