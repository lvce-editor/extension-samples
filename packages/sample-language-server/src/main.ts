import { activate, registerLanguageServer } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  registerLanguageServer({
    argv: [],
    id: 'sample.sprout-server',
    languageId: 'sprout-lsp',
    uri: 'dist/server.mjs',
  })
}

main().catch(console.error)
