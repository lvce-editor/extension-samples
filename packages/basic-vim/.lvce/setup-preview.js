/** @public */
export const setupPreview = async ({ executeCommand }) => {
  await executeCommand('basicVim.start')
}

/** @public */
export const reloadPreview = async (context) => {
  await setupPreview(context)
}
