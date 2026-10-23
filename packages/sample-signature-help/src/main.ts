import { activate, executeCommand, registerCommand, registerSignatureHelpProvider } from '@lvce-editor/api'
import { provideSignatureHelp } from './provide-signature-help.ts'

const main = async (): Promise<void> => {
  await activate()
  registerSignatureHelpProvider({ id: 'sample-mix-signature', languageId: 'plaintext', provideSignatureHelp })
  registerCommand({
    id: 'sample.showSignatureHelp',
    // eslint-disable-next-line perfectionist/sort-objects -- sample API command IDs precede their handlers
    async execute() {
      await executeCommand('Editor.showSignatureHelp')
    },
  })
}

main().catch(console.error)
