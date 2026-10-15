import { activate, registerCommand, registerDocumentSymbolProvider, setPreference } from '@lvce-editor/api'
import { provideDocumentSymbols } from './provide-document-symbols.ts'

const ready = activate().then(async () => {
  registerDocumentSymbolProvider({ id: 'sample-document-symbols', languageId: 'plaintext', provideDocumentSymbols })
  await setPreference('breadcrumbs.enabled', true)
})

registerCommand({
  async execute() {
    await ready
  },
  id: 'sample.initializeDocumentSymbols',
})

ready.catch(console.error)
