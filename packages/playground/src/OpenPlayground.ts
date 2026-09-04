import { executeCommand } from '@lvce-editor/api'
import { compileAndActivate } from './RuntimeCompiler.ts'
import { prepareSampleSource } from './SampleSource.ts'

const getOptions = async (): Promise<{ reset: boolean; sampleId: string }> => {
  const href = (await executeCommand('Layout.getHref')) as string
  const parameters = new URL(href).searchParams
  const value = parameters.get('sample')
  return {
    reset: parameters.has('reset'),
    sampleId: value === 'source-control-provider' ? value : 'file-system-provider',
  }
}

const hideWorkbenchChrome = async (): Promise<void> => {
  await executeCommand('Layout.hideSideBar')
  await executeCommand('Layout.hideActivityBar')
  await executeCommand('Layout.hideStatusBar')
  await executeCommand('Layout.hideTitleBar')
}

const openFileSystemSample = async (sourceUri: string): Promise<void> => {
  await executeCommand('Main.closeAllEditors')
  await executeCommand('Main.openUri', sourceUri)
  await executeCommand('Main.splitRight')
  await executeCommand('Main.openUri', 'sample-memfs:///README.md')
}

const openSourceControlSample = async (sourceUri: string): Promise<void> => {
  await executeCommand('Main.closeAllEditors')
  await executeCommand('Main.openUri', sourceUri)
  await executeCommand('Layout.openSecondarySideBarViewlet', 'Source Control')
  await executeCommand('Layout.showSecondarySideBar')
}

export const openPlayground = async (): Promise<void> => {
  const { reset, sampleId } = await getOptions()
  if (reset) {
    await executeCommand('LocalStorage.setText', `extension-samples:${sampleId}`, '')
  }
  const { source, sourceUri } = await prepareSampleSource(sampleId)
  await compileAndActivate(sampleId, source)
  await executeCommand('Layout.showMain')
  if (sampleId === 'source-control-provider') {
    await openSourceControlSample(sourceUri)
  } else {
    await openFileSystemSample(sourceUri)
  }
  await hideWorkbenchChrome()
}
