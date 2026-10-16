import { activate, registerDefinitionProvider, registerReferenceProvider } from '@lvce-editor/api'
import { provideDefinition } from './provide-definition.ts'
import { provideReferences } from './provide-references.ts'

const main = async (): Promise<void> => {
  await activate()
  registerDefinitionProvider({
    id: 'sample-definition',
    languageId: 'plaintext',
    provideDefinition,
  })
  registerReferenceProvider({ id: 'sample-references', languageId: 'plaintext', provideReferences })
}

main()
