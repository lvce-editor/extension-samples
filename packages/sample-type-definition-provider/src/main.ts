import { activate, registerTypeDefinitionProvider } from '@lvce-editor/api'
import { provideTypeDefinition } from './provide-type-definition.ts'

const main = async (): Promise<void> => {
  await activate()
  registerTypeDefinitionProvider({
    id: 'sample-type-definition',
    languageId: 'plaintext',
    provideTypeDefinition,
  })
}

main().catch(console.error)
