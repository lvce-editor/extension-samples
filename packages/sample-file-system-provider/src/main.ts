import { activate as activateExtensionApi, registerFileSystemProvider } from '@lvce-editor/api'
import { createFileSystemProvider } from './file-system-provider.ts'

const main = async (): Promise<void> => {
  await activateExtensionApi()
  registerFileSystemProvider(createFileSystemProvider())
}

main()
