export const previewApiSource = String.raw`
const registry = {
  fileSystemProvider: undefined,
  sourceControlProvider: undefined,
}

const element = (tag, className, text) => {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

const setMessage = (text) => {
  const message = document.querySelector('[data-preview-message]')
  message.textContent = text
}

const showFile = async (provider, uri, label) => {
  const content = await provider.readFile(uri)
  const heading = document.querySelector('[data-file-heading]')
  const output = document.querySelector('[data-file-content]')
  heading.textContent = label
  output.textContent = typeof content === 'string' ? content : new TextDecoder().decode(content)
}

const renderFileSystem = async (provider) => {
  const app = document.querySelector('#app')
  app.replaceChildren()
  app.append(element('div', 'ProviderTitle', 'File system · ' + provider.id))
  app.append(element('div', 'ProviderSubtitle', 'memfs:///'))

  const layout = element('div', 'FileSystemLayout')
  const tree = element('div', 'FileTree')
  tree.setAttribute('aria-label', 'File system contents')
  const filePreview = element('div', 'FilePreview')
  const fileHeading = element('div', 'FileHeading', 'Select a file')
  fileHeading.dataset.fileHeading = ''
  const fileContent = element('pre', 'FileContent', '')
  fileContent.dataset.fileContent = ''
  filePreview.append(fileHeading, fileContent)

  const renderDirectory = async (uri, depth) => {
    const entries = await provider.readDirWithFileTypes(uri)
    const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of sorted) {
      const isDirectory = entry.type === 'directory' || entry.type === 2
      const row = element('button', 'FileRow', (isDirectory ? '▸ ' : '  ') + entry.name)
      row.type = 'button'
      row.style.paddingLeft = 12 + depth * 16 + 'px'
      tree.append(row)
      const childUri = uri.replace(/\/$/, '') + '/' + entry.name
      if (isDirectory) {
        row.addEventListener('click', async () => {
          if (row.dataset.expanded === 'true') return
          row.dataset.expanded = 'true'
          row.textContent = '▾ ' + entry.name
          await renderDirectory(childUri, depth + 1)
        })
      } else {
        row.addEventListener('click', () => showFile(provider, childUri, entry.name))
        if (!fileHeading.dataset.initialized) {
          fileHeading.dataset.initialized = 'true'
          await showFile(provider, childUri, entry.name)
        }
      }
    }
  }

  const actions = element('div', 'PreviewActions')
  const createButton = element('button', 'PreviewButton', 'Create note.txt')
  createButton.type = 'button'
  createButton.addEventListener('click', async () => {
    await provider.writeFile(provider.id + ':///note.txt', 'Created from the live preview')
    setMessage('Created note.txt')
    await renderFileSystem(provider)
  })
  actions.append(createButton)
  layout.append(tree, filePreview)
  app.append(actions, layout)
  await renderDirectory(provider.id + ':///', 0)
}

const renderSourceControl = async (provider, message = '') => {
  const app = document.querySelector('#app')
  app.replaceChildren()
  app.append(element('div', 'ProviderTitle', 'Source Control · ' + provider.id))
  const inputRow = element('div', 'CommitRow')
  const input = element('input', 'CommitInput')
  input.placeholder = 'Message (Ctrl+Enter to commit)'
  input.setAttribute('aria-label', 'Commit message')
  const generateButton = element('button', 'IconButton', '✨')
  generateButton.type = 'button'
  generateButton.title = 'Generate commit message'
  generateButton.addEventListener('click', async () => {
    input.value = await provider.generateCommitMessage()
  })
  const commitButton = element('button', 'PreviewButton', 'Commit')
  commitButton.type = 'button'
  const commit = async () => {
    const result = await provider.acceptInput(input.value)
    await renderSourceControl(provider, String(result || 'Committed'))
  }
  commitButton.addEventListener('click', commit)
  input.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'Enter') commit()
  })
  inputRow.append(input, generateButton, commitButton)
  app.append(inputRow)

  const groups = await provider.getGroups('/workspace')
  for (const group of groups) {
    const section = element('section', 'SourceControlGroup')
    const heading = element('h2', 'GroupHeading', group.label)
    heading.append(element('span', 'CountBadge', String(group.items.length)))
    section.append(heading)
    for (const item of group.items) {
      const row = element('div', 'ChangeRow')
      const path = element('span', 'ChangePath', item.file.replace('/workspace/', ''))
      const badge = element('span', 'ChangeBadge', item.status === 1 ? 'M' : 'A')
      const discard = element('button', 'RowAction', 'Discard')
      discard.type = 'button'
      discard.addEventListener('click', async () => {
        await provider.discard(item.file)
        await renderSourceControl(provider, 'Discarded ' + item.file)
      })
      row.append(path, badge, discard)
      section.append(row)
    }
    app.append(section)
  }
  if (message) setMessage(message)
}

export const activate = async () => {}
export const registerFileSystemProvider = (provider) => {
  registry.fileSystemProvider = provider
}
export const registerSourceControlProvider = (provider) => {
  registry.sourceControlProvider = provider
}

globalThis.__renderExtensionSample = async () => {
  if (registry.fileSystemProvider) {
    await renderFileSystem(registry.fileSystemProvider)
  } else if (registry.sourceControlProvider) {
    await renderSourceControl(registry.sourceControlProvider)
  } else {
    throw new Error('The extension did not register a supported provider')
  }
  document.body.dataset.previewReady = 'true'
}
`
