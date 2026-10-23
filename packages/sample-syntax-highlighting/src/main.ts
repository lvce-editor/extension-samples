import { activate } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
}

main().catch(console.error)
