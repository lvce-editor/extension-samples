/** @public */
export const setupPreview = async ({ openFile, setCursor, showRename }) => {
  await openFile('example.txt')
  await setCursor(2, 7)
  await showRename()
}
