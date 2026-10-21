import { activate, executeCommand, registerCommand, registerEditorKeymap, type EditorKeymapHandle } from '@lvce-editor/api'

// cspell:words keymap
const main = async (): Promise<void> => {
  await activate()
  let keymap: Promise<EditorKeymapHandle> | undefined

  let mode = 'normal'

  const editorCommands: Readonly<Record<string, string>> = {
    $: 'Editor.cursorEnd',
    '0': 'Editor.cursorHome',
    a: 'Editor.cursorCharacterRight',
    A: 'Editor.cursorEnd',
    b: 'Editor.cursorWordLeft',
    h: 'Editor.cursorCharacterLeft',
    I: 'Editor.cursorHome',
    j: 'Editor.cursorDown',
    k: 'Editor.cursorUp',
    l: 'Editor.cursorCharacterRight',
    u: 'Editor.undo',
    w: 'Editor.cursorWordRight',
    x: 'Editor.deleteCharacterRight',
  }

  const handleKey = async (key: string): Promise<void> => {
    if (key === 'Escape') {
      mode = 'normal'
      return
    }
    if (mode !== 'normal') return
    const command = editorCommands[key]
    if (typeof command === 'string') await executeCommand(command)
    if (['i', 'I', 'a', 'A'].includes(key)) mode = 'insert'
  }

  const start = async (): Promise<void> => {
    if (keymap) {
      await keymap
      return
    }
    mode = 'normal'
    keymap = registerEditorKeymap('sample.basic-vim')
    try {
      await keymap
    } catch (error) {
      keymap = undefined
      throw error
    }
  }

  const stop = async (): Promise<void> => {
    const handle = await keymap
    await handle?.dispose()
    keymap = undefined
  }

  registerCommand({ execute: handleKey, id: 'basicVim.handleKey' })
  registerCommand({ execute: start, id: 'basicVim.start' })
  registerCommand({ execute: stop, id: 'basicVim.stop' })
}

main()
