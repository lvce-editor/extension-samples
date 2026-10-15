import { mountPlayground } from './Playground.ts'

const parameters = new URL(location.href)
parameters.searchParams.set('applicationHost', '1')
history.replaceState(null, '', parameters)

const removeApplicationHostParameter = (): void => {
  const url = new URL(location.href)
  url.searchParams.delete('applicationHost')
  history.replaceState(null, '', url)
}

const prefix = document.body.dataset.routePrefix || '.'
try {
  const response = await fetch(`${prefix}/runtime.json`)
  if (!response.ok) throw new Error(`Unable to load the editor runtime: ${response.status}`)
  const { config, entry, sourceExtensions } = (await response.json()) as {
    config: Record<string, unknown>
    entry: string
    sourceExtensions: readonly unknown[]
  }
  const configElement = document.createElement('script')
  configElement.id = 'Config'
  configElement.type = 'application/json'
  configElement.textContent = JSON.stringify(config)
  document.head.append(configElement)
  const renderer = await import(entry)
  await renderer.ready
  await renderer.executeCommand('Application.waitForHost')
  await mountPlayground(renderer.executeCommand, prefix, sourceExtensions)
  removeApplicationHostParameter()
} catch (error) {
  document.querySelector('#preview-status')!.textContent = String(error)
}
