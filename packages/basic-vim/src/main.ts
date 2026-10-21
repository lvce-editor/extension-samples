import { activate, registerCommand, registerEditorKeymap, type EditorKeymapHandle } from '@lvce-editor/api'

// cspell:words keymap
const main = async (): Promise<void> => {
  await activate()
  let keymap: Promise<EditorKeymapHandle> | undefined

  const start = async (): Promise<void> => {
    if (keymap) {
      await keymap
      return
    }
    keymap = registerEditorKeymap({
      cursorStyle: 'block',
      initialMode: 'normal',
      modes: {
        insert: { bindings: { Escape: { mode: 'normal' } } },
        normal: {
          bindings: {
            $: { command: 'Editor.cursorEnd' },
            '0': { command: 'Editor.cursorHome' },
            a: { command: 'Editor.cursorCharacterRight', mode: 'insert' },
            A: { command: 'Editor.cursorEnd', mode: 'insert' },
            b: { command: 'Editor.cursorWordLeft' },
            h: { command: 'Editor.cursorCharacterLeft' },
            i: { mode: 'insert' },
            I: { command: 'Editor.cursorHome', mode: 'insert' },
            j: { command: 'Editor.cursorDown' },
            k: { command: 'Editor.cursorUp' },
            l: { command: 'Editor.cursorCharacterRight' },
            u: { command: 'Editor.undo' },
            w: { command: 'Editor.cursorWordRight' },
            x: { command: 'Editor.deleteCharacterRight' },
          },
          captureText: true,
        },
      },
    })
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

  registerCommand({ execute: start, id: 'basicVim.start' })
  registerCommand({ execute: stop, id: 'basicVim.stop' })
}

main()
