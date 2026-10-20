import { activate, registerCommand, registerDocumentSymbolProvider, setPreference } from '@lvce-editor/api'
import { provideDocumentSymbols } from './provide-document-symbols.ts'

const main = async (): Promise<void> => {
  await activate()
  registerDocumentSymbolProvider({ id: 'sample-document-symbols', languageId: 'plaintext', provideDocumentSymbols })
  const ready = setPreference('breadcrumbs.enabled', true)
  registerCommand({
    async execute() {
      await ready
    },
    id: 'sample.initializeDocumentSymbols',
  })
  await ready
}

main().catch(console.error)
