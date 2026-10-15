import { activate, executeCommand, registerCommand, registerSignatureHelpProvider } from '@lvce-editor/api'
import { provideSignatureHelp } from './provide-signature-help.ts'

const ready = activate().then(() => {
  registerSignatureHelpProvider({ id: 'sample-mix-signature', languageId: 'plaintext', provideSignatureHelp })
})

registerCommand({
  async execute() {
    await ready
    await executeCommand('Editor.showSignatureHelp')
  },
  id: 'sample.showSignatureHelp',
})

ready.catch(console.error)
