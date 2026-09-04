import { executeCommand, readFile, registerFileChangeHandler, writeFile } from '@lvce-editor/api'
import { compileAndActivate } from './RuntimeCompiler.ts'

const configSource = `export default [{ rules: { 'no-debugger': 'error', 'no-unused-vars': 'warn' } }]`

const readPersistedSource = async (sampleId: string): Promise<string | undefined> => {
  return (await executeCommand('LocalStorage.getText', `extension-samples:${sampleId}`)) as string | undefined
}

const persistSource = async (sampleId: string, source: string): Promise<void> => {
  await executeCommand('LocalStorage.setText', `extension-samples:${sampleId}`, source)
}

export const prepareSampleSource = async (sampleId: string): Promise<{ source: string; sourceUri: string; workspaceUri: string }> => {
  const defaultSourceResponse = await fetch(new URL(`samples/${sampleId}/main.ts`, import.meta.url))
  if (!defaultSourceResponse.ok) {
    throw new Error(`Failed to load the ${sampleId} sample source`)
  }
  const defaultSource = await defaultSourceResponse.text()
  const source = (await readPersistedSource(sampleId)) || defaultSource
  const workspaceUri = `memfs:///extension-samples/${sampleId}`
  const sourceUri = `${workspaceUri}/main.ts`
  await writeFile(sourceUri, source)
  await writeFile(`${workspaceUri}/eslint.config.js`, configSource)
  registerFileChangeHandler(async ({ changed }) => {
    if (!changed?.includes(sourceUri)) {
      return
    }
    const updatedSource = await readFile(sourceUri)
    await compileAndActivate(sampleId, updatedSource)
    await persistSource(sampleId, updatedSource)
    queueMicrotask(() => void executeCommand('Reload.reload'))
  })
  return { source, sourceUri, workspaceUri }
}
