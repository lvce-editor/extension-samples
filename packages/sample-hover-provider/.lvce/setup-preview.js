export const setupPreview = async ({ openFile, setCursor, showHover }) => {
  await openFile('example.txt')
  await setCursor(0, 0)
  await showHover()
}
