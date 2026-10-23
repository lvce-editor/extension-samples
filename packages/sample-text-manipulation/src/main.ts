import {
  activate,
  closeUri,
  executeCommand,
  focusNextTab,
  focusPreviousTab,
  getEditorSelections,
  getWorkspaceUri,
  openUri,
  registerCommand,
  setEditorSelections,
  writeFile,
} from '@lvce-editor/api'

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
  // eslint-disable-next-line perfectionist/sort-objects -- sample API command IDs precede their handlers
  registerCommand({ id: 'sample.collapseSelections', execute: collapseSelections })
  registerCommand({
    id: 'sample.openExampleTabs',
    // eslint-disable-next-line perfectionist/sort-objects -- sample API command IDs precede their handlers
    async execute() {
      const root = await getWorkspaceUri()
      await writeFile(`${root}/first-tab.txt`, 'First example tab')
      await writeFile(`${root}/second-tab.txt`, 'Second example tab')
      await openUri(`${root}/first-tab.txt`)
      await openUri(`${root}/second-tab.txt`)
    },
  })
  // eslint-disable-next-line perfectionist/sort-objects -- sample API command IDs precede their handlers
  registerCommand({ id: 'sample.focusPreviousExampleTab', execute: focusPreviousTab })
  // eslint-disable-next-line perfectionist/sort-objects -- sample API command IDs precede their handlers
  registerCommand({ id: 'sample.focusNextExampleTab', execute: focusNextTab })
  registerCommand({
    id: 'sample.closeExampleTabs',
    // eslint-disable-next-line perfectionist/sort-objects -- sample API command IDs precede their handlers
    async execute() {
      const root = await getWorkspaceUri()
      await closeUri(`${root}/second-tab.txt`)
      await closeUri(`${root}/first-tab.txt`)
    },
  })
  registerCommand({
    id: 'sample.insertText',
    // eslint-disable-next-line perfectionist/sort-objects -- sample API command IDs precede their handlers
    execute: insertText,
  })
}

main()
