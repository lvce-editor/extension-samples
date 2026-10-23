/** @public */
export const setupPreview = async ({ openFile, setCursor, showCompletions }) => {
  await openFile('example.txt')
  await setCursor(0, 9)
  await showCompletions()
}
