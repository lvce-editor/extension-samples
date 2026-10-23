import { activate, getWorkspaceUri, registerCommand, registerStatusBarItemProvider, showQuickPick } from '@lvce-editor/api'

const sourceWorkspacePrefix = 'sample-source://'

interface Sample {
  readonly route: string
  readonly title: string
}

interface PlaygroundMessage {
  readonly applicationId?: string
  readonly requestId?: string
  readonly route?: string
  readonly sampleId?: string
  readonly samples?: readonly Sample[]
  readonly sampleTitle?: string
  readonly status?: string
  readonly type?: string
}

const getApplicationId = (workspaceUri: string): 'preview' | 'source' => {
  if (workspaceUri.startsWith(sourceWorkspacePrefix)) return 'source'
  return 'preview'
}

const main = async (): Promise<void> => {
  await activate()
  const workspaceUri = await getWorkspaceUri()
  const applicationId = getApplicationId(workspaceUri)

  const channelName = new URL(import.meta.url).searchParams.get('channel')
  if (!channelName) throw new Error('The playground channel is missing from the extension URL')
  const channel = new BroadcastChannel(channelName)
  let sampleTitle = 'Loading…'
  let status = 'Loading…'
  const send = (message: PlaygroundMessage): void => channel.postMessage({ ...message, applicationId })
  registerStatusBarItemProvider({
    getStatusBarItem: () => (applicationId === 'source' ? { ariaLabel: 'Source', text: 'Source', title: 'Editable sample source' } : undefined),
    id: 'playground.source',
  })
  registerStatusBarItemProvider({
    getStatusBarItem: () => (applicationId === 'preview' ? { ariaLabel: 'Preview', text: 'Preview', title: 'Sample preview' } : undefined),
    id: 'playground.preview',
  })
  const sampleStatusBar = registerStatusBarItemProvider({
    getStatusBarItem: () =>
      applicationId === 'source'
        ? {
            ariaLabel: 'Choose a sample',
            name: 'playground.selectSample',
            onClick: 'playground.selectSample',
            text: `Sample: ${sampleTitle}`,
            title: 'Choose a sample',
          }
        : undefined,
    id: 'playground.sample',
  })
  registerStatusBarItemProvider({
    getStatusBarItem: () =>
      applicationId === 'source'
        ? { ariaLabel: 'Reset sample', name: 'playground.resetSample', onClick: 'playground.resetSample', text: 'Reset', title: 'Reset sample' }
        : undefined,
    id: 'playground.reset',
  })
  const statusBar = registerStatusBarItemProvider({
    getStatusBarItem: () => (applicationId === 'preview' ? { ariaLabel: status, text: status, title: 'Preview build status' } : undefined),
    id: 'playground.status',
  })
  const refresh = async (): Promise<void> => {
    await Promise.all([sampleStatusBar.refresh(), statusBar.refresh()])
  }
  const pendingSampleRequests = new Map<string, (samples: readonly Sample[]) => void>()

  channel.addEventListener('message', ({ data }: MessageEvent<PlaygroundMessage>) => {
    if (data.applicationId !== applicationId) return
    if (data.type === 'state') {
      const { sampleTitle: nextSampleTitle, status: nextStatus } = data
      sampleTitle = nextSampleTitle || sampleTitle
      status = nextStatus || status
      void refresh()
    }
    if (data.type === 'status' && applicationId === 'preview' && typeof data.status === 'string') {
      const { status: nextStatus } = data
      status = nextStatus
      void refresh()
    }
    if (data.type === 'samples' && data.requestId && Array.isArray(data.samples)) {
      const resolver = pendingSampleRequests.get(data.requestId)
      pendingSampleRequests.delete(data.requestId)
      resolver?.(data.samples)
    }
  })

  const getSamples = (): Promise<readonly Sample[]> => {
    const requestId = crypto.randomUUID()
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        pendingSampleRequests.delete(requestId)
        resolve([])
      }, 10_000)
      pendingSampleRequests.set(requestId, (samples) => {
        clearTimeout(timeout)
        resolve(samples)
      })
      send({ requestId, type: 'request-samples' })
    })
  }

  registerCommand({
    async execute() {
      const samples = await getSamples()
      if (samples.length === 0) return
      const route = await showQuickPick({
        items: [
          ...samples
            .toSorted((a, b) => a.title.localeCompare(b.title))
            .map(({ route, title }) => ({ description: route, label: title, value: route })),
          { description: 'Restore the original source files', label: 'Reset sample', value: '__reset_sample__' },
        ],
        placeholder: 'Choose an extension sample',
        type: 'select',
      })
      // Escape returns undefined; keep the selected sample and URL unchanged.
      if (route === '__reset_sample__') send({ type: 'reset-sample' })
      else if (typeof route === 'string') send({ route, type: 'select-sample' })
    },
    id: 'playground.selectSample',
  })
  registerCommand({
    execute() {
      send({ type: 'reset-sample' })
    },
    id: 'playground.resetSample',
  })
  send({ type: 'ready' })
}

await main()
