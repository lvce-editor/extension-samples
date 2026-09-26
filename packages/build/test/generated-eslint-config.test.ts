import { ESLint } from 'eslint'
import { expect, test } from '@jest/globals'
import { rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { readWorkspace } from '../src/build.ts'
import { samples } from '../src/samples.ts'

const root = resolve(import.meta.dirname, '../../..')

test('each generated workspace has one self-contained, loadable ESLint config', async () => {
  const workspaces = await Promise.all(
    samples.map(async (sample) => {
      const files = await readWorkspace(resolve(root, 'packages', sample.packageName))
      expect(Object.keys(files).filter((path) => path.endsWith('/eslint.config.js'))).toEqual(['/eslint.config.js'])
      expect(files).not.toHaveProperty('/eslint.samples.config.js')
      expect(files['/eslint.config.js']).not.toContain('eslint.samples.config.js')
      return files
    }),
  )

  const configPath = resolve(root, 'packages', samples[0].packageName, 'eslint.generated.test.config.js')
  try {
    await writeFile(configPath, workspaces[0]['/eslint.config.js'])
    const eslint = new ESLint({ cwd: root, overrideConfigFile: configPath })
    const config = await eslint.calculateConfigForFile(resolve(root, 'packages', samples[0].packageName, 'src/main.ts'))
    expect(config?.rules['unicorn/no-for-each']).toEqual([2])
    expect(config?.languageOptions.parserOptions.project).toBe(false)
    expect(config?.languageOptions.parserOptions.projectService).toBe(false)
    expect(config?.languageOptions.parserOptions.tsconfigRootDir).toBe('/sample')
  } finally {
    await rm(configPath, { force: true })
  }
})
