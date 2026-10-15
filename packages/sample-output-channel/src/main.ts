import {
  activate,
  createOutputChannel,
  getCacheStorageItem,
  openOutputView,
  registerCommand,
  removeCacheStorageItem,
  setCacheStorageItem,
} from '@lvce-editor/api'

const output = createOutputChannel('sample-build')

const main = async (): Promise<void> => {
  const ready = activate().then(() => output.appendLine('Ready. Run Sample: Run Build from the command palette.'))
  let build = 0
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
  await ready
}

main().catch(console.error)
