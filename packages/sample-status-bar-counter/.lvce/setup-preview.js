/** @public */
export const setupPreview = async ({ executeCommand, showStatusBar }) => {
  await executeCommand('sample.initializeStatusBarCounter')
  await showStatusBar()
}

/** @public */
export const reloadPreview = async (context) => {
  await setupPreview(context)
}
