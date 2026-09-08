import { build } from 'esbuild'
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { builtinModules, createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { brotliDecompressSync } from 'node:zlib'
import { x as extractTar } from 'tar'
import { createIgnoreHashes } from './CreateIgnoreHashes.ts'
import { createHtml } from './html.ts'
import { samples } from './samples.ts'

const root = resolve(import.meta.dirname, '../../..')
const outputRoot = join(root, '.tmp', 'static')
const require = createRequire(import.meta.url)
const writeJson = async (path: string, value: unknown): Promise<void> => {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(value, undefined, 2)}\n`)
}

const readWorkspace = async (directory: string): Promise<Record<string, string>> => {
  const files: Record<string, string> = {}
  const visit = async (path: string): Promise<void> => {
    for (const entry of await readdir(join(directory, path), { withFileTypes: true })) {
      if (['node_modules', 'dist', '.git'].includes(entry.name)) continue
      const relative = `${path}/${entry.name}`
      if (entry.isDirectory()) await visit(relative)
      else if (!relative.endsWith('.tsbuildinfo')) files[relative] = await readFile(join(directory, relative), 'utf8')
    }
  }
  await visit('')
  files['/eslint.samples.config.js'] = await readFile(join(root, 'eslint.samples.config.js'), 'utf8')
  files['/eslint.config.js'] =
    "import tseslint from 'typescript-eslint'\nimport config from './eslint.samples.config.js'\n\n// Typed linting runs in CI; the browser filesystem does not yet support TypeScript projects.\nexport default [...config.map(entry => ({ ...entry, files: ['**/*.ts'] })), { ...tseslint.configs.disableTypeChecked, files: ['**/*.ts'], languageOptions: { parserOptions: { project: false, projectService: false, tsconfigRootDir: '/sample' } } }]\n"
  return files
}

const buildTooling = async (): Promise<Record<string, string>> => {
  const files: Record<string, string> = {}
  for (const [name, entry] of [
    ['eslint', 'eslint/universal'],
    ['typescript-eslint', 'typescript-eslint'],
    ['eslint-plugin-unicorn', 'eslint-plugin-unicorn'],
  ]) {
    const result = await build({
      entryPoints: [require.resolve(entry)],
      bundle: true,
      platform: 'browser',
      format: 'cjs',
      external: ['node:*', ...builtinModules],
      write: false,
    })
    files[`/node_modules/${name}/index.cjs`] = result.outputFiles[0].text
    files[`/node_modules/${name}/package.json`] = JSON.stringify({ name, main: 'index.cjs' })
  }
  const apiRoot = dirname(dirname(require.resolve('@lvce-editor/api')))
  const visit = async (relative: string): Promise<void> => {
    for (const entry of await readdir(join(apiRoot, relative), { withFileTypes: true })) {
      const path = `${relative}/${entry.name}`
      if (entry.isDirectory()) await visit(path)
      else if (entry.name.endsWith('.d.ts')) files[`/node_modules/@lvce-editor/api${path}`] = await readFile(join(apiRoot, path), 'utf8')
    }
  }
  await visit('/dist')
  files['/node_modules/@lvce-editor/api/package.json'] = await readFile(join(apiRoot, 'package.json'), 'utf8')
  return files
}

const installEslint = async (commitHash: string, pathPrefix: string): Promise<void> => {
  const version = '1.17.0'
  const response = await fetch(`https://github.com/lvce-editor/eslint/releases/download/v${version}/eslint-v${version}.tar.br`)
  if (!response.ok) throw new Error(`Failed to download ESLint: ${response.status}`)
  const archivePath = join(root, '.tmp', 'eslint-extension.tar')
  await writeFile(archivePath, brotliDecompressSync(Buffer.from(await response.arrayBuffer())))
  const extensionDirectory = join(root, 'dist', commitHash, 'extensions', 'builtin.eslint')
  await mkdir(extensionDirectory, { recursive: true })
  await extractTar({ cwd: extensionDirectory, file: archivePath })
  const manifest = JSON.parse(await readFile(join(extensionDirectory, 'extension.json'), 'utf8'))
  for (const name of ['extensions.json', 'webExtensions.json']) {
    const path = join(root, 'dist', commitHash, 'config', name)
    const extensions = JSON.parse(await readFile(path, 'utf8')) as { id: string }[]
    await writeJson(path, [
      ...extensions.filter(({ id }) => id !== manifest.id),
      {
        ...manifest,
        isWeb: true,
        path: `${pathPrefix}/${commitHash}/extensions/${manifest.id}`,
      },
    ])
  }
}

export const buildStatic = async (): Promise<void> => {
  await rm(outputRoot, { recursive: true, force: true })
  await mkdir(outputRoot, { recursive: true })
  const sharedProcess = await import(
    pathToFileURL(join(dirname(require.resolve('@lvce-editor/shared-process')), 'src/parts/ExportStatic/ExportStatic.js')).href
  )
  const pathPrefix = '/extension-samples/runtime'
  let commitHash: string
  if (process.env.LVCE_STATIC_PATH) {
    // A local LVCE static build must use PATH_PREFIX=/extension-samples/runtime.
    await rm(join(root, 'dist'), { recursive: true, force: true })
    await cp(process.env.LVCE_STATIC_PATH, join(root, 'dist'), { recursive: true })
    commitHash = (await readdir(join(root, 'dist'))).find((name) => /^[a-f0-9]{7,40}$/.test(name))!
  } else {
    ;({ commitHash } = await sharedProcess.exportStatic({ root, pathPrefix }))
  }
  await installEslint(commitHash, pathPrefix)
  await cp(join(root, 'dist'), join(outputRoot, 'runtime'), { recursive: true })
  const assetDir = `${pathPrefix}/${commitHash}`
  const webExtensions = JSON.parse(await readFile(join(root, 'dist', commitHash, 'config', 'webExtensions.json'), 'utf8'))
  // ESLint owns source diagnostics; retain TypeScript's other language features
  // without running a second full diagnostic pass on every playground edit.
  const sourceExtensions = webExtensions
    .filter((extension: { id: string }) => extension.id === 'builtin.language-features-typescript')
    .map((extension: object) => ({ ...extension, diagnosticProviders: [] }))
  await writeJson(join(outputRoot, 'runtime.json'), { entry: `${assetDir}/packages/renderer-process/dist/rendererProcessMain.js`, sourceExtensions })
  await writeJson(join(outputRoot, 'tooling.json'), await buildTooling())

  const assets = join(outputRoot, 'assets')
  await mkdir(assets, { recursive: true })
  for (const [entry, output] of [
    ['site.ts', 'site.js'],
    ['CompilerWorker.ts', 'compiler.js'],
  ]) {
    await build({
      bundle: true,
      entryPoints: [join(root, 'packages/playground/src', entry)],
      format: 'esm',
      outfile: join(assets, output),
      platform: 'browser',
      target: 'esnext',
      sourcemap: true,
    })
  }
  await build({
    bundle: true,
    entryPoints: [require.resolve('@lvce-editor/api')],
    format: 'esm',
    outfile: join(assets, 'api.js'),
    platform: 'browser',
    target: 'es2022',
    external: ['node:*', 'electron'],
  })
  await cp(join(root, 'node_modules/esbuild-wasm/esbuild.wasm'), join(assets, 'esbuild.wasm'))
  await cp(join(root, 'packages/playground/src/app.css'), join(assets, 'app.css'))
  for (const sample of samples) {
    const packageRoot = join(root, 'packages', sample.packageName)
    const files = await readWorkspace(packageRoot)
    await writeJson(join(outputRoot, 'samples', sample.id, 'files.json'), files)
    await writeJson(join(outputRoot, 'samples', sample.id, 'eslint-ignore-hashes.json'), createIgnoreHashes(files))
    await build({
      bundle: true,
      entryPoints: [join(packageRoot, 'src/main.ts')],
      external: ['@lvce-editor/api'],
      format: 'esm',
      outfile: join(packageRoot, 'dist/main.js'),
      platform: 'browser',
      sourcemap: true,
      target: 'es2022',
    })
    await build({
      alias: { '@lvce-editor/api': join(assets, 'api.js') },
      bundle: true,
      entryPoints: [join(packageRoot, 'src/main.ts')],
      format: 'esm',
      outfile: join(outputRoot, 'samples', sample.id, 'main.js'),
      platform: 'browser',
      target: 'es2022',
    })
    const route = join(outputRoot, sample.route)
    await mkdir(route, { recursive: true })
    await writeFile(join(route, 'index.html'), createHtml(sample, true, assetDir))
  }
  await writeFile(join(outputRoot, 'index.html'), createHtml(samples[0], false, assetDir))
  await writeFile(join(outputRoot, '404.html'), createHtml(samples[0], false, assetDir))
  await writeJson(join(outputRoot, 'samples.json'), samples)
  await writeFile(join(outputRoot, '.nojekyll'), '')
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) await buildStatic()
