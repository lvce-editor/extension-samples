import { activate, registerRenameProvider } from '@lvce-editor/api'
import { provideRename } from './provide-rename.ts'

const main = async (): Promise<void> => {
  await activate()
  registerRenameProvider({
    id: 'sample-rename',
    languageId: 'sample-rename-provider',
    provideRename,
  })
}

main().catch(console.error)
