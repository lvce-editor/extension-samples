import { expect, test } from '@jest/globals'
import { createHtml, getRuntimeConfigScript } from '../src/html.ts'
import { samples } from '../src/samples.ts'

test('creates a nested static route with relative assets', () => {
  const html = createHtml(samples[0], true)
  expect(html).toMatch(/id="source-ide"/)
  expect(html).toMatch(/rel="icon" href="\.\.\/runtime\/favicon\.ico" type="image\/x-icon"/)
  expect(html).toMatch(/src="\.\.\/assets\/site\.js"/)
  expect(html).toMatch(/id="preview-ide"/)
  expect(html).not.toMatch(/iframe/)
})

test('creates a root route with root-relative sample assets', () => {
  const html = createHtml(samples[0], false)
  expect(html).toMatch(/id="source-ide"/)
  expect(html).toMatch(/rel="icon" href="\.\/runtime\/favicon\.ico" type="image\/x-icon"/)
  expect(html).toMatch(/src="\.\/assets\/site\.js"/)
})

test('preserves exported runtime worker URLs before the playground bootstraps', () => {
  const config =
    '<script id="Config" type="application/json">{"assetDir":"/runtime/release","platform":"web","rendererWorkerUrl":"/runtime/worker.js"}</script>'
  const script = getRuntimeConfigScript(`<html><head>${config}</head></html>`)
  const html = createHtml(samples[0], true, '/runtime/release', script)
  expect(html).toContain(config)
  expect(html.indexOf(config)).toBeLessThan(html.indexOf('assets/site.js'))
  expect(() => getRuntimeConfigScript('<html></html>')).toThrow('missing its Config script')
})
