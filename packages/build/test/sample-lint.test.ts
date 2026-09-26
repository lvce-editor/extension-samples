import { ESLint } from 'eslint'
import { expect, test } from '@jest/globals'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { samples } from '../src/samples.ts'

const root = resolve(import.meta.dirname, '../../..')
const eslint = new ESLint({ cwd: root })

for (const sample of samples) {
  test(`${sample.id} rejects unsafe types, unhandled promises, and Unicorn violations`, async () => {
    const filePath = resolve(root, 'packages', sample.packageName, 'src/main.ts')
    const source = await readFile(filePath, 'utf8')
    const [baseline] = await eslint.lintText(source, { filePath })
    expect(baseline.messages).toEqual([])

    for (const [rule, code] of [
      ['@typescript-eslint/no-explicit-any', 'export type Unsafe = any'],
      ['@typescript-eslint/no-unsafe-return', 'export const unsafe = (): string => JSON.parse(\'"value"\')'],
      ['@typescript-eslint/no-floating-promises', "Promise.resolve('lint test')"],
      ['unicorn/no-for-each', '[1].forEach(value => value)'],
    ]) {
      const [result] = await eslint.lintText(`${source}\n${code}\n`, { filePath })
      expect(result.fatalErrorCount).toBe(0)
      expect(result.messages).toContainEqual(expect.objectContaining({ ruleId: rule, severity: 2 }))
    }
  })
}
