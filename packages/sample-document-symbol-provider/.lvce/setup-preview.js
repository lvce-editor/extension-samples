/** @public */
export const setupPreview = async ({ executeCommand, setCursor }) => {
  await executeCommand('sample.initializeDocumentSymbols')
  await setCursor(0, 2)
}

/** @public */
export const reloadPreview = async (context) => {
  await setupPreview(context)
}
