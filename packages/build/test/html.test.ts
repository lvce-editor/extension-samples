import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createHtml } from '../src/html.ts'
import { samples } from '../src/samples.ts'

test('creates a nested static route with relative assets', () => {
  const html = createHtml(samples[0], true)
  assert.match(html, /src="\.\.\/workbench\/file-system-provider\/\?sample=file-system-provider"/)
  assert.match(html, /src="\.\.\/assets\/site\.js"/)
  assert.match(html, /title="LVCE Editor workbench"/)
})

test('creates a root route with root-relative sample assets', () => {
  const html = createHtml(samples[0], false)
  assert.match(html, /src="\.\/workbench\/file-system-provider\/\?sample=file-system-provider"/)
  assert.match(html, /src="\.\/assets\/site\.js"/)
})
