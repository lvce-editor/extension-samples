/** @public */
export const setupPreview = async ({ executeCommand, showStatusBar }) => {
  await executeCommand('sample.initializeStatusBar')
  await showStatusBar()
}

/** @public */
export const reloadPreview = setupPreview
