import { activate, createOutputChannel, openOutputView, registerCommand } from '@lvce-editor/api'

const output = createOutputChannel('sample-build')

const main = async (): Promise<void> => {
  await activate()
  let build = 0
  await output.appendLine('Ready. Run Sample: Run Build from the command palette.')
  registerCommand({
    async execute() {
      build++
      await openOutputView({ channel: 'sample-build' })
      await output.appendLine(`Build ${String(build)}: starting`)
      await output.append('Compiling example.sample... ')
      await output.appendLine('done')
      await output.appendLine('Build succeeded.')
    },
    id: 'sample.runBuild',
  })
  registerCommand({
    async execute() {
      await output.clear()
      await openOutputView({ channel: 'sample-build' })
    },
    id: 'sample.clearBuildOutput',
  })
}

main().catch(console.error)
