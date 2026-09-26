import { expect, test } from '@jest/globals'
import { createHtml } from '../src/html.ts'
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
