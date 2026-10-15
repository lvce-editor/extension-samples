import { activate, registerDocumentSymbolProvider, setPreference } from '@lvce-editor/api'
import { provideDocumentSymbols } from './provide-document-symbols.ts'

const main = async (): Promise<void> => {
  await activate()
  registerDocumentSymbolProvider({ id: 'sample-document-symbols', languageId: 'plaintext', provideDocumentSymbols })
  await setPreference('breadcrumbs.enabled', true)
}

main().catch(console.error)
