import { activate, getActiveEditor, openColorPicker, registerCommand } from '@lvce-editor/api'

const main = async (): Promise<void> => {
  await activate()
  registerCommand({
    id: 'sample.openColorPicker',
    // eslint-disable-next-line perfectionist/sort-objects -- sample API command IDs precede their handlers
    async execute() {
      const editor = await getActiveEditor()
      if (!editor) {
        return
      }
      await openColorPicker(editor.id, '#ff8800')
    },
  })
}

main()
