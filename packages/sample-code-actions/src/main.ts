import { activate, registerCodeActionsProvider } from '@lvce-editor/api'
import { organizeImports } from './organize-imports.ts'

const main = async (): Promise<void> => {
  await activate()
  registerCodeActionsProvider({
    id: 'sample-code-actions',
    languageId: 'plaintext',
    provideCodeActions() {
      return [{ execute: organizeImports, kind: 'source.organizeImports', name: 'Organize Imports' }]
    },
  })
}

main().catch(console.error)
