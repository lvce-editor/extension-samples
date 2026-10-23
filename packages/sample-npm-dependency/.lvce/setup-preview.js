/** @public */
export const setupPreview = async ({ executeCommand }) => {
  await executeCommand('sample.addNumbers')
}

/** @public */
export const reloadPreview = async (context) => {
  await setupPreview(context)
}
