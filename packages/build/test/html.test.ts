import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createHtml } from '../src/html.ts'
import { samples } from '../src/samples.ts'

test('creates a nested static route with relative assets', () => {
  const html = createHtml(samples[0], true)
  assert.match(html, /id="source-ide"/)
  assert.match(html, /src="\.\.\/assets\/site\.js"/)
  assert.match(html, /id="preview-ide"/)
  assert.doesNotMatch(html, /iframe/)
})

test('creates a root route with root-relative sample assets', () => {
  const html = createHtml(samples[0], false)
  assert.match(html, /id="source-ide"/)
  assert.match(html, /src="\.\/assets\/site\.js"/)
})
