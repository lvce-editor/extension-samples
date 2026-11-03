import { build } from 'esbuild'
import Path from 'node:path'

await build({
  bundle: true,
  entryPoints: [Path.resolve(import.meta.dirname, 'src/main.ts')],
  external: ['@lvce-editor/api'],
  format: 'esm',
  outfile: Path.resolve(import.meta.dirname, 'dist/main.js'),
  platform: 'browser',
})
await build({
  bundle: true,
  entryPoints: [Path.resolve(import.meta.dirname, 'src/server.ts')],
  format: 'esm',
  outfile: Path.resolve(import.meta.dirname, 'dist/server.mjs'),
  platform: 'node',
})
