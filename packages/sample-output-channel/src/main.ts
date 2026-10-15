import { activate, createOutputChannel, openOutputView, registerCommand } from '@lvce-editor/api'

const output = createOutputChannel('sample-build')

const main = async (): Promise<void> => {
  let build = 0
  const ready = activate().then(() => output.appendLine('Ready. Run Sample: Run Build from the command palette.'))
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
  await ready
}

main().catch(console.error)
