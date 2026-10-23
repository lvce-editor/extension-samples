import { activate, registerDiagnosticProvider } from '@lvce-editor/api'
import { getDiagnostics } from './get-diagnostics.ts'

const main = async (): Promise<void> => {
  await activate()
  registerDiagnosticProvider({
    id: 'sample-diagnostics',
    languageId: 'plaintext',
    provideDiagnostics(document) {
      return getDiagnostics(document.text)
    },
  })
}

main()
