import { activate, exists, getWorkspaceUri, openUrisInThreeColumns, registerCommand, writeFile } from '@lvce-editor/api'

const createFileIfMissing = async (uri: string, content: string): Promise<void> => {
  if (!(await exists(uri))) {
    await writeFile(uri, content)
  }
}

const main = async (): Promise<void> => {
  await activate()
  registerCommand({
    id: 'sample.openThreeEditors',
    async execute() {
      const root = await getWorkspaceUri()
      const htmlUri = `${root}/index.html`
      const cssUri = `${root}/styles.css`
      const jsUri = `${root}/main.js`
      await Promise.all([
        createFileIfMissing(
          htmlUri,
          '<!doctype html>\n<html>\n  <head><link rel="stylesheet" href="styles.css"></head>\n  <body><script src="main.js"></script></body>\n</html>\n',
        ),
        createFileIfMissing(cssUri, 'body {\n  font-family: sans-serif;\n  color: navy;\n}\n'),
        createFileIfMissing(jsUri, "document.body.insertAdjacentHTML('afterbegin', '<h1>Hello from three editors</h1>')\n"),
      ])
      await openUrisInThreeColumns([htmlUri, cssUri, jsUri])
    },
  })
}

main()
