import { activate, executeCommand, registerCommand, registerEditorKeymap, type EditorKeymapHandle } from '@lvce-editor/api'

// cspell:words keymap
const wordCharacter = /[a-zA-Z\u{C0}-\u{17F}\d]/u
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

  // eslint-disable-next-line perfectionist/sort-objects -- sample API command IDs precede their handlers
  registerCommand({ id: 'basicVim.handleKey', execute: handleKey })
  // eslint-disable-next-line perfectionist/sort-objects -- sample API command IDs precede their handlers
  registerCommand({ id: 'basicVim.consumeKey', execute: () => undefined })
  // eslint-disable-next-line perfectionist/sort-objects -- sample API command IDs precede their handlers
  registerCommand({ id: 'basicVim.deleteWord', execute: deleteWord })
  // eslint-disable-next-line perfectionist/sort-objects -- sample API command IDs precede their handlers
  registerCommand({ id: 'basicVim.start', execute: start })
  // eslint-disable-next-line perfectionist/sort-objects -- sample API command IDs precede their handlers
  registerCommand({ id: 'basicVim.stop', execute: stop })
}

main()
