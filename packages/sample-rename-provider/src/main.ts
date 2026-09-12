import { activate, registerRenameProvider } from '@lvce-editor/api'
import { provideRename } from './provide-rename.ts'

const main = async (): Promise<void> => {
  await activate()
  registerRenameProvider({
    id: 'sample-rename',
    languageId: 'plaintext',
    provideRename,
  })
}

main().catch(console.error)
