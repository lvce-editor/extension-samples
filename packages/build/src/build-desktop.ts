import { build } from 'esbuild'
import { resolve } from 'node:path'
import { samples } from './samples.ts'

const id = process.argv[2]
const sample = samples.find((sample) => sample.id === id)
if (!sample) throw new Error('Provide a sample ID, for example: npm run build:desktop -- hello-world')
const root = resolve(import.meta.dirname, '../../..')
await build({
  bundle: true,
  entryPoints: [resolve(root, 'packages', sample.packageName, 'src/main.ts')],
  external: ['node:*', 'electron'],
  format: 'esm',
  loader: { '.css': 'text' },
  outfile: resolve(root, 'packages', sample.packageName, 'dist/main.js'),
  platform: 'browser',
  target: 'es2022',
})
