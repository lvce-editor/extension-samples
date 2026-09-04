/* eslint-disable unicorn/no-top-level-side-effects */
import { activate as activateExtensionApi, registerCommand } from '@lvce-editor/api'
import { openPlayground } from './OpenPlayground.ts'
import { registerProviderRouters } from './ProviderRouter.ts'

export const activate = async (): Promise<void> => {
  await activateExtensionApi()
  registerProviderRouters()
  registerCommand({
    execute() {
      setTimeout(() => void openPlayground(), 500)
    },
    id: 'extensionSamples.openPlayground',
  })
}

await activate()
