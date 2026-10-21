import { expect, test } from '@jest/globals'
import { createHtml } from '../src/html.ts'
import { samples } from '../src/samples.ts'

test('creates a nested static route with relative assets', () => {
  const html = createHtml(samples[0], true)
  expect(html).toContain('<title>basic-vim - Extension Samples - Lvce Editor</title>')
  expect(html).toMatch(/id="source-ide"/)
  expect(html).toMatch(/rel="icon" href="\.\.\/runtime\/favicon\.ico" type="image\/x-icon"/)
  expect(html).toMatch(/src="\.\.\/assets\/site\.js"/)
  expect(html).toMatch(/id="preview-ide"/)
  expect(html).not.toMatch(/iframe/)
})

test('creates a root route with root-relative sample assets', () => {
  const html = createHtml(samples[0], false)
  expect(html).toContain('<title>basic-vim - Extension Samples - Lvce Editor</title>')
  expect(html).toMatch(/id="source-ide"/)
  expect(html).toMatch(/rel="icon" href="\.\/runtime\/favicon\.ico" type="image\/x-icon"/)
  expect(html).toMatch(/src="\.\/assets\/site\.js"/)
})

test('escapes the sample id in the document title', () => {
  const html = createHtml({ ...samples[0], id: 'sample<id>&"' }, false)
  expect(html).toContain('<title>sample&lt;id&gt;&amp;&quot; - Extension Samples - Lvce Editor</title>')
})

test('passes exported worker configuration to the runtime before startup', () => {
  const config = {
    assetDir: '/extension-samples/runtime/abc1234',
    platform: 'web',
    rendererWorkerUrl: '/extension-samples/runtime/abc1234/packages/renderer-worker/dist/rendererWorkerMain.js',
    workerUrls: { 'develop.editorWorkerPath': '/extension-samples/runtime/abc1234/packages/editor-worker/dist/editorWorkerMain.js' },
  }
  for (const nested of [false, true]) {
    const html = createHtml(samples[0], nested, config.assetDir, config)
    const match = html.match(/<script id="Config" type="application\/json">([\s\S]*?)<\/script>/)
    expect(match).not.toBeNull()
    expect(JSON.parse(match![1])).toEqual(config)
    expect(html.indexOf('id="Config"')).toBeLessThan(html.indexOf('type="module"'))
  }
})

test('escapes HTML inside runtime configuration', () => {
  const config = { assetDir: '</script><script>alert(1)</script>' }
  const html = createHtml(samples[0], false, undefined, config)
  const match = html.match(/<script id="Config" type="application\/json">([\s\S]*?)<\/script>/)!
  expect(match[1]).not.toContain('<')
  expect(JSON.parse(match[1])).toEqual(config)
})
