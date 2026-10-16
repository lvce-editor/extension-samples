import { activate, openColorPicker, registerCommand } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  registerCommand({
    async execute() {
      await openColorPicker('#ff8800')
    },
    id: 'sample.openColorPicker',
  })
}

main()
