import { mountPlayground } from './Playground.ts'

const parameters = new URL(location.href)
parameters.searchParams.set('applicationHost', '1')
history.replaceState(null, '', parameters)

const prefix = document.body.dataset.routePrefix || '.'
try {
  const response = await fetch(`${prefix}/runtime.json`)
  if (!response.ok) throw new Error(`Unable to load the editor runtime: ${response.status}`)
  const { entry, sourceExtensions } = (await response.json()) as { entry: string; sourceExtensions: readonly unknown[] }
  const renderer = await import(entry)
  await renderer.ready
  await renderer.executeCommand('Application.waitForHost')
  await mountPlayground(renderer.executeCommand, prefix, sourceExtensions)
} catch (error) {
  document.querySelector('#preview-status')!.textContent = String(error)
}
