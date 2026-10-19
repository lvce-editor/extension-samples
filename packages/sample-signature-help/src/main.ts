import { activate, executeCommand, registerCommand, registerSignatureHelpProvider } from '@lvce-editor/api'
import { provideSignatureHelp } from './provide-signature-help.ts'

const main = async (): Promise<void> => {
  await activate()
  registerSignatureHelpProvider({ id: 'sample-mix-signature', languageId: 'plaintext', provideSignatureHelp })
  registerCommand({
    async execute() {
      await executeCommand('Editor.showSignatureHelp')
    },
    id: 'sample.showSignatureHelp',
  })
}

main().catch(console.error)
