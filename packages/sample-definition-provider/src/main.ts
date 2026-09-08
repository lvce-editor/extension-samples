import { activate, registerDefinitionProvider } from '@lvce-editor/api'
import { provideDefinition } from './provide-definition.ts'

const main = async (): Promise<void> => {
  await activate()
  registerDefinitionProvider({
    id: 'sample-definition',
    languageId: 'plaintext',
    provideDefinition,
  })
}

main().catch(console.error)
