import { build } from 'esbuild'
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { createHtml } from './html.ts'
import { samples } from './samples.ts'

const root = resolve(import.meta.dirname, '../../..')
const outputRoot = join(root, '.tmp', 'static')

const copyFile = async (from: string, to: string): Promise<void> => {
  await mkdir(dirname(to), { recursive: true })
  await cp(from, to)
}

const buildExtensionPackages = async (): Promise<void> => {
  await Promise.all(
    samples.map(async (sample) => {
      const packageRoot = join(root, 'packages', sample.packageName)
      await build({
        bundle: true,
        entryPoints: [join(packageRoot, 'src', 'main.ts')],
        external: ['@lvce-editor/api'],
        format: 'esm',
        outfile: join(packageRoot, 'dist', 'main.js'),
        platform: 'browser',
        sourcemap: true,
        target: 'es2022',
      })
    }),
  )
}

const copySamples = async (): Promise<void> => {
  for (const sample of samples) {
    const packageRoot = join(root, 'packages', sample.packageName)
    const sampleOutput = join(outputRoot, 'samples', sample.id)
    await copyFile(join(packageRoot, 'extension.json'), join(sampleOutput, 'extension.json'))
    await copyFile(join(packageRoot, 'src', 'main.ts'), join(sampleOutput, 'src', 'main.ts'))
    await copyFile(join(packageRoot, 'dist', 'main.js'), join(sampleOutput, 'dist', 'main.js'))
    await copyFile(join(packageRoot, 'dist', 'main.js.map'), join(sampleOutput, 'dist', 'main.js.map'))
  }
}

const buildPlayground = async (): Promise<void> => {
  await build({
    bundle: true,
    entryPoints: [join(root, 'packages', 'playground', 'src', 'main.ts')],
    format: 'esm',
    outfile: join(outputRoot, 'assets', 'app.js'),
    platform: 'browser',
    sourcemap: true,
    target: 'es2022',
  })
  await copyFile(join(root, 'packages', 'playground', 'src', 'app.css'), join(outputRoot, 'assets', 'app.css'))
  await copyFile(join(root, 'node_modules', 'esbuild-wasm', 'esbuild.wasm'), join(outputRoot, 'assets', 'esbuild.wasm'))
}

const writeRoutes = async (): Promise<void> => {
  const [defaultSample] = samples
  await writeFile(join(outputRoot, 'index.html'), createHtml(defaultSample, false))
  await writeFile(join(outputRoot, '404.html'), createHtml(defaultSample, false))
  for (const sample of samples) {
    const routeRoot = join(outputRoot, sample.route)
    await mkdir(routeRoot, { recursive: true })
    await writeFile(join(routeRoot, 'index.html'), createHtml(sample, true))
  }
  await writeFile(join(outputRoot, 'samples.json'), `${JSON.stringify(samples, undefined, 2)}\n`)
  await writeFile(join(outputRoot, '.nojekyll'), '')
}

export const buildStatic = async (): Promise<void> => {
  await rm(outputRoot, { force: true, recursive: true })
  await mkdir(outputRoot, { recursive: true })
  await buildExtensionPackages()
  await Promise.all([buildPlayground(), copySamples()])
  await writeRoutes()
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  await buildStatic()
}
