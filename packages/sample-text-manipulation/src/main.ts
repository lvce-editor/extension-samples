import { activate, executeCommand, getEditorSelections, registerCommand, setEditorSelections } from '@lvce-editor/api'

const insertText = async (): Promise<void> => {
  await executeCommand('Editor.type', 'Hello, World!')
}

const collapseSelections = async (): Promise<void> => {
  const selections = await getEditorSelections()
  await setEditorSelections(
    selections.map(({ endColumnIndex, endRowIndex }) => ({
      endColumnIndex,
      endRowIndex,
      startColumnIndex: endColumnIndex,
      startRowIndex: endRowIndex,
    })),
  )
}

const main = async (): Promise<void> => {
  await activate()
  registerCommand({ execute: collapseSelections, id: 'sample.collapseSelections' })
  registerCommand({
    execute: insertText,
    id: 'sample.insertText',
  })
}

main()
