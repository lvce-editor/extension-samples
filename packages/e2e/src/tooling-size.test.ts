import { expect, test } from '@playwright/test'

test('keeps the browser tooling payload below fourteen megabytes', async ({ request }) => {
  const response = await request.get('/extension-samples/tooling.json')
  expect(response.ok()).toBe(true)
  const body = await response.body()
  expect(body.byteLength).toBeLessThan(14_000_000)
  const files = JSON.parse(body.toString())
  for (const name of ['eslint', 'typescript-eslint', 'eslint-plugin-unicorn']) {
    expect(files[`/node_modules/${name}/index.cjs`]).toBeTruthy()
    expect(JSON.parse(files[`/node_modules/${name}/package.json`]).main).toBe('index.cjs')
  }
})
