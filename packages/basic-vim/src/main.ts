import { activate, executeCommand, registerCommand, registerEditorKeymap, type EditorKeymapHandle } from '@lvce-editor/api'

// cspell:words keymap
const wordCharacter = /[a-zA-Z\u{C0}-\u{17F}\d]/u
const main = async (): Promise<void> => {
  await activate()
  let keymap: Promise<EditorKeymapHandle> | undefined

  const deleteWord = async (): Promise<void> => {
    const selections = (await executeCommand('GetActiveEditor.getSelections')) as readonly number[] | undefined
    const document = (await executeCommand('GetActiveEditor.getTextDocument')) as { readonly text: string } | undefined
    if (!selections?.length || !document) return
    const [row, column] = selections
    if (row === undefined || column === undefined) return
    const character = document.text.split('\n')[row]?.[column]
    if (!character || !wordCharacter.test(character)) return
    await executeCommand('Editor.selectWord', row, column)
    await executeCommand('Editor.deleteLeft')
  }

  // Consume invalid sequence keys and return to normal mode without inserting them.
  const cancelBindings = Object.fromEntries(
    [...Array.from({ length: 95 }, (_, index) => String.fromCodePoint(index + 32)), 'Enter', 'Backspace', 'Delete', 'Escape'].map((key) => [
      key,
      { mode: 'normal' },
    ]),
  )

  const start = async (): Promise<void> => {
    if (keymap) {
      await keymap
      return
    }
    keymap = registerEditorKeymap({
      cursorStyle: 'block',
      initialMode: 'normal',
      modes: {
        change: { bindings: { ...cancelBindings, a: { mode: 'changeAround' } }, captureText: true },
        changeAround: {
          bindings: {
            ...cancelBindings,
            w: { args: ['basicVim.deleteWord'], command: 'ExtensionHost.executeCommand', mode: 'insert' },
          },
          captureText: true,
        },
        delete: { bindings: { ...cancelBindings, a: { mode: 'deleteAround' } }, captureText: true },
        deleteAround: {
          bindings: {
            ...cancelBindings,
            w: { args: ['basicVim.deleteWord'], command: 'ExtensionHost.executeCommand', mode: 'normal' },
          },
          captureText: true,
        },
        insert: { bindings: { Escape: { mode: 'normal' } } },
        normal: {
          bindings: {
            $: { command: 'Editor.cursorEnd' },
            '0': { command: 'Editor.cursorHome' },
            a: { command: 'Editor.cursorCharacterRight', mode: 'insert' },
            A: { command: 'Editor.cursorEnd', mode: 'insert' },
            b: { command: 'Editor.cursorWordLeft' },
            c: { mode: 'change' },
            d: { mode: 'delete' },
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
  registerCommand({ execute: deleteWord, id: 'basicVim.deleteWord' })
}

main()
