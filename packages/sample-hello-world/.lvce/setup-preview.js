/** @public */
export const setupPreview = async ({ executeCommand }) => {
  await executeCommand('sample.helloWorld')
}

/** @public */
export const reloadPreview = async (context) => {
  await setupPreview(context)
}
