import { build } from 'esbuild'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { brotliDecompress } from 'node:zlib'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'
import { x as extractTar } from 'tar'
import { createHtml } from './html.ts'
import { samples } from './samples.ts'

const root = resolve(import.meta.dirname, '../../..')
const outputRoot = join(root, '.tmp', 'static')
const playgroundRoot = join(root, 'packages', 'playground')
const eslintVersion = '1.17.0'
const eslintRoot = join(root, '.tmp', 'extensions', 'builtin.eslint')
const decompressBrotli = promisify(brotliDecompress)

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

const buildPlaygroundExtension = async (): Promise<void> => {
  const outputDirectory = join(playgroundRoot, 'dist')
  await rm(outputDirectory, { force: true, recursive: true })
  await mkdir(outputDirectory, { recursive: true })
  await build({
    bundle: true,
    entryPoints: [join(playgroundRoot, 'src', 'extensionMain.ts')],
    external: ['electron', 'node:*'],
    format: 'esm',
    outfile: join(outputDirectory, 'extensionMain.js'),
    platform: 'browser',
    sourcemap: true,
    target: 'esnext',
  })
  await copyFile(join(root, 'node_modules', 'esbuild-wasm', 'esbuild.wasm'), join(outputDirectory, 'esbuild.wasm'))
  for (const sample of samples) {
    await copyFile(join(root, 'packages', sample.packageName, 'src', 'main.ts'), join(outputDirectory, 'samples', sample.id, 'main.ts'))
  }
}

const buildSite = async (): Promise<void> => {
  await build({
    bundle: true,
    entryPoints: [join(playgroundRoot, 'src', 'site.ts')],
    format: 'esm',
    outfile: join(outputRoot, 'assets', 'site.js'),
    platform: 'browser',
    sourcemap: true,
    target: 'es2022',
  })
  await copyFile(join(playgroundRoot, 'src', 'app.css'), join(outputRoot, 'assets', 'app.css'))
}

const downloadEslintExtension = async (): Promise<void> => {
  const archiveUrl = `https://github.com/lvce-editor/eslint/releases/download/v${eslintVersion}/eslint-v${eslintVersion}.tar.br`
  const response = await fetch(archiveUrl)
  if (!response.ok) {
    throw new Error(`Failed to download ESLint extension ${eslintVersion}: ${response.status}`)
  }
  const compressed = Buffer.from(await response.arrayBuffer())
  const archive = await decompressBrotli(compressed)
  const archivePath = join(root, '.tmp', 'eslint-extension.tar')
  await rm(eslintRoot, { force: true, recursive: true })
  await mkdir(eslintRoot, { recursive: true })
  await writeFile(archivePath, archive)
  await extractTar({ cwd: eslintRoot, file: archivePath })
  await rm(archivePath)
}

interface ExtensionManifest {
  readonly id: string
  readonly [key: string]: unknown
}

const installEslintExtension = async (commitHash: string, pathPrefix: string): Promise<void> => {
  const extensionDirectory = join(root, 'dist', commitHash, 'extensions', 'builtin.eslint')
  await rm(extensionDirectory, { force: true, recursive: true })
  await cp(eslintRoot, extensionDirectory, { recursive: true })
  const manifest = JSON.parse(await readFile(join(eslintRoot, 'extension.json'), 'utf8')) as ExtensionManifest
  const path = `${pathPrefix}/${commitHash}/extensions/${manifest.id}`
  const configRoot = join(root, 'dist', commitHash, 'config')
  const extensionsPath = join(configRoot, 'extensions.json')
  const extensions = JSON.parse(await readFile(extensionsPath, 'utf8')) as ExtensionManifest[]
  await writeFile(extensionsPath, `${JSON.stringify([...extensions.filter(({ id }) => id !== manifest.id), { ...manifest, path }], undefined, 2)}\n`)
  const webExtensionsPath = join(configRoot, 'webExtensions.json')
  const webExtensions = JSON.parse(await readFile(webExtensionsPath, 'utf8')) as ExtensionManifest[]
  await writeFile(
    webExtensionsPath,
    `${JSON.stringify([...webExtensions.filter(({ id }) => id !== manifest.id), { ...manifest, isWeb: true, path }], undefined, 2)}\n`,
  )
}

const createPlaygroundExtension = async (sampleId: string): Promise<string> => {
  const extensionRoot = join(root, '.tmp', 'playground-extensions', sampleId)
  await rm(extensionRoot, { force: true, recursive: true })
  await mkdir(extensionRoot, { recursive: true })
  await cp(join(playgroundRoot, 'src'), join(extensionRoot, 'src'), { recursive: true })
  const manifest = JSON.parse(await readFile(join(playgroundRoot, 'extension.json'), 'utf8')) as Record<string, unknown>
  if (sampleId !== 'source-control-provider') {
    delete manifest.sourceControlProviders
  }
  await writeFile(join(extensionRoot, 'extension.json'), `${JSON.stringify(manifest, undefined, 2)}\n`)
  return extensionRoot
}

const exportWorkbench = async (sampleId: string): Promise<void> => {
  const sharedProcessUrl = pathToFileURL(join(root, 'node_modules', '@lvce-editor', 'shared-process', 'index.js')).toString()
  const sharedProcess = await import(sharedProcessUrl)
  const pathPrefix = `/extension-samples/workbench/${sampleId}`
  process.env.PATH_PREFIX = pathPrefix
  const extensionPath = await createPlaygroundExtension(sampleId)
  const { commitHash } = await sharedProcess.exportStatic({
    extensionPath,
    onLoadCommands: [
      {
        args: [],
        command: 'extensionSamples.openPlayground',
        name: 'Open extension sample playground',
      },
    ],
    root,
  })
  await cp(join(playgroundRoot, 'dist'), join(root, 'dist', commitHash, 'extensions', 'builtin.extension-samples-playground', 'dist'), {
    force: true,
    recursive: true,
  })
  await installEslintExtension(commitHash, pathPrefix)
  await cp(join(root, 'dist'), join(outputRoot, 'workbench', sampleId), { recursive: true })
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
  await Promise.all([buildExtensionPackages(), buildPlaygroundExtension(), downloadEslintExtension()])
  for (const sample of samples) {
    await exportWorkbench(sample.id)
  }
  await Promise.all([buildSite(), copySamples()])
  await writeRoutes()
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  await buildStatic()
}
