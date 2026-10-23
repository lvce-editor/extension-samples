import { build } from 'esbuild'
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { builtinModules, createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { brotliDecompressSync } from 'node:zlib'
import { x as extractTar } from 'tar'
import { createIgnoreHashes } from './CreateIgnoreHashes.ts'
import { createHtml } from './html.ts'
import { samples } from './samples.ts'
// This shim is also passed to esbuild's JavaScript inject option.
// @ts-expect-error The JavaScript shim exports the injected process and its own file URL.
import { process as browserProcess, processShimUrl } from './process-shim.js'

const root = resolve(import.meta.dirname, '../../..')
const outputRoot = join(root, '.tmp', 'static')
const require = createRequire(import.meta.url)
const sampleRequire = createRequire(join(root, 'packages/sample-file-system-provider/package.json'))
const browserAliases = {
  assert: require.resolve('assert/'),
  buffer: require.resolve('buffer/'),
  events: require.resolve('events/'),
  path: require.resolve('path-browserify'),
  process: require.resolve('process/browser'),
  stream: require.resolve('stream-browserify'),
  util: require.resolve('util/'),
}
const browserInject = [fileURLToPath(processShimUrl)]
// esbuild injects the exported process identifier into browser bundles that use it.
void browserProcess
const writeJson = async (path: string, value: unknown): Promise<void> => {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(value, undefined, 2)}\n`)
}

export const readWorkspace = async (directory: string): Promise<Record<string, string>> => {
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
  const sampleConfig = await readFile(join(root, 'eslint.samples.config.js'), 'utf8')
  files['/eslint.config.js'] =
    `${sampleConfig}\n// Typed linting runs in CI; the browser filesystem does not yet support TypeScript projects.\nexport default [...sampleConfig.map(entry => ({ ...entry, files: ['**/*.ts'] })), { ...tseslint.configs.disableTypeChecked, files: ['**/*.ts'], languageOptions: { parserOptions: { project: false, projectService: false, tsconfigRootDir: '/sample' } } }]\n`
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
  const memfsRoot = dirname(sampleRequire.resolve('memfs/package.json'))
  const memfsBundle = await build({
    alias: browserAliases,
    bundle: true,
    format: 'esm',
    inject: browserInject,
    minify: true,
    platform: 'browser',
    stdin: {
      contents: "export { createFsFromVolume, Volume } from 'memfs'",
      resolveDir: join(root, 'packages/sample-file-system-provider'),
      sourcefile: 'memfs-entry.js',
    },
    write: false,
  })
  files['/node_modules/memfs/index.js'] = memfsBundle.outputFiles[0].text
  files['/node_modules/memfs/package.json'] = JSON.stringify({ name: 'memfs', main: 'index.js', types: 'lib/index.d.ts' })
  const visitMemfsTypes = async (relative: string): Promise<void> => {
    for (const entry of await readdir(join(memfsRoot, relative), { withFileTypes: true })) {
      const path = `${relative}/${entry.name}`
      if (entry.isDirectory()) await visitMemfsTypes(path)
      else if (entry.name.endsWith('.d.ts')) files[`/node_modules/memfs/${path}`] = await readFile(join(memfsRoot, path), 'utf8')
    }
  }
  await visitMemfsTypes('lib')
  for (const name of ['@lvce-editor/api', '@lvce-editor/virtual-dom-worker', '@lvce-editor/constants']) {
    const packageRoot = dirname(dirname(require.resolve(name)))
    const visit = async (relative: string): Promise<void> => {
      for (const entry of await readdir(join(packageRoot, relative), { withFileTypes: true })) {
        const path = `${relative}/${entry.name}`
        if (entry.isDirectory()) await visit(path)
        else if (entry.name.endsWith('.d.ts') || (name === '@lvce-editor/api' && entry.name.endsWith('.js')))
          files[`/node_modules/${name}/${path}`] = await readFile(join(packageRoot, path), 'utf8')
      }
    }
    await visit('dist')
    files[`/node_modules/${name}/package.json`] = await readFile(join(packageRoot, 'package.json'), 'utf8')
  }
  const lodash = await build({
    bundle: true,
    entryPoints: [require.resolve('lodash')],
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    write: false,
  })
  files['/node_modules/lodash/lodash.js'] = lodash.outputFiles[0].text
  files['/node_modules/lodash/index.js'] = `import lodash from './lodash.js'\nexport const add = lodash.add\nexport default lodash\n`
  files['/node_modules/lodash/package.json'] = JSON.stringify({
    main: 'index.js',
    name: 'lodash',
    types: '../@types/lodash/index.d.ts',
  })
  const lodashTypesRoot = dirname(require.resolve('@types/lodash/package.json'))
  const copyLodashTypes = async (relative: string): Promise<void> => {
    for (const entry of await readdir(join(lodashTypesRoot, relative), { withFileTypes: true })) {
      const path = relative ? `${relative}/${entry.name}` : entry.name
      if (entry.isDirectory()) await copyLodashTypes(path)
      else if (entry.name.endsWith('.d.ts') || path === 'package.json') {
        files[`/node_modules/@types/lodash/${path}`] = await readFile(join(lodashTypesRoot, path), 'utf8')
      }
    }
  }
  await copyLodashTypes('')
  const esbuildRoot = dirname(require.resolve('esbuild/package.json'))
  for (const path of ['package.json', 'README.md', 'LICENSE.md', 'install.js', 'lib/main.js', 'lib/main.d.ts']) {
    files[`/node_modules/esbuild/${path}`] = await readFile(join(esbuildRoot, path), 'utf8')
  }
  // Keep the installed CLI byte-for-byte; on Unix npm may replace it with a native executable.
  await cp(join(esbuildRoot, 'bin/esbuild'), join(outputRoot, 'esbuild-bin'))
  return files
}

const installExtension = async (name: string, version: string, commitHash: string, pathPrefix: string): Promise<void> => {
  const response = await fetch(`https://github.com/lvce-editor/${name}/releases/download/v${version}/${name}-v${version}.tar.br`)
  if (!response.ok) throw new Error(`Failed to download ${name}: ${response.status}`)
  const archivePath = join(root, '.tmp', `${name}-extension.tar`)
  await writeFile(archivePath, brotliDecompressSync(Buffer.from(await response.arrayBuffer())))
  const extensionDirectory = join(root, 'dist', commitHash, 'extensions', `builtin.${name}`)
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
  const settingsPath = join(root, 'dist', commitHash, 'config', 'defaultSettings.json')
  const settings = JSON.parse(await readFile(settingsPath, 'utf8'))
  await writeJson(settingsPath, { ...settings, 'application.useOnLoadJson': true })
  // Keep editor input ordered with shortcuts through the renderer worker.
  await cp(dirname(require.resolve('@lvce-editor/renderer-process')), join(root, 'dist', commitHash, 'packages', 'renderer-process', 'dist'), {
    recursive: true,
  })
  // Ship editor fixes independently of the full server runtime release.
  await cp(dirname(require.resolve('@lvce-editor/editor-worker')), join(root, 'dist', commitHash, 'packages', 'editor-worker', 'dist'), {
    recursive: true,
  })
  // Keep application-scoped diagnostic streaming compatible with the editor worker.
  await cp(
    dirname(require.resolve('@lvce-editor/extension-management-worker')),
    join(root, 'dist', commitHash, 'packages', 'extension-management-worker', 'dist'),
    { recursive: true },
  )
  await installExtension('eslint', '1.20.0', commitHash, pathPrefix)
  await installExtension('language-features-typescript', '5.35.0', commitHash, pathPrefix)
  await installExtension('prettier', '2.23.1', commitHash, pathPrefix)
  await cp(join(root, 'dist'), join(outputRoot, 'runtime'), { recursive: true })
  const assetDir = `${pathPrefix}/${commitHash}`
  const runtimeHtml = await readFile(join(outputRoot, 'runtime', 'index.html'), 'utf8')
  const runtimeConfigText = runtimeHtml.match(/<script id="Config" type="application\/json">([\s\S]*?)<\/script>/)?.[1]
  if (!runtimeConfigText) throw new Error('Runtime config not found in exported index.html')
  const runtimeConfig = JSON.parse(runtimeConfigText)
  const webExtensions = JSON.parse(await readFile(join(root, 'dist', commitHash, 'config', 'webExtensions.json'), 'utf8'))
  // ESLint owns diagnostics and Prettier owns formatting; retain TypeScript's other language features.
  const sourceExtensions = webExtensions
    .filter((extension: { id: string }) => ['builtin.language-features-typescript', 'builtin.prettier'].includes(extension.id))
    .map((extension: { id: string }) =>
      extension.id === 'builtin.language-features-typescript' ? { ...extension, diagnosticProviders: [], formattingProviders: [] } : extension,
    )
  await writeJson(join(outputRoot, 'runtime.json'), { entry: `${assetDir}/packages/renderer-process/dist/rendererProcessMain.js`, sourceExtensions })
  await writeJson(join(outputRoot, 'tooling.json'), await buildTooling())

  const assets = join(outputRoot, 'assets')
  await mkdir(assets, { recursive: true })
  for (const [entry, output] of [
    ['site.ts', 'site.js'],
    ['CompilerWorker.ts', 'compiler.js'],
    ['SourceFileSystem.ts', 'source-files.js'],
  ]) {
    await build({
      alias: browserAliases,
      bundle: true,
      entryPoints: [join(root, 'packages/playground/src', entry)],
      external: ['node:*', 'electron'],
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
  await cp(require.resolve('esbuild-wasm/esbuild.wasm'), join(assets, 'esbuild.wasm'))
  await cp(join(root, 'packages/playground/src/app.css'), join(assets, 'app.css'))
  for (const sample of samples) {
    const packageRoot = join(root, 'packages', sample.packageName)
    const files = await readWorkspace(packageRoot)
    await writeJson(join(outputRoot, 'samples', sample.id, 'files.json'), files)
    await writeJson(join(outputRoot, 'samples', sample.id, 'eslint-ignore-hashes.json'), createIgnoreHashes(files))
    await build({
      alias: browserAliases,
      bundle: true,
      entryPoints: [join(packageRoot, 'src/main.ts')],
      external: ['@lvce-editor/api'],
      format: 'esm',
      inject: browserInject,
      loader: { '.css': 'text' },
      outfile: join(packageRoot, 'dist/main.js'),
      platform: 'browser',
      sourcemap: true,
      target: 'es2022',
    })
    await cp(join(packageRoot, 'dist'), join(outputRoot, 'samples', sample.id, 'dist'), { recursive: true })
    await build({
      alias: { ...browserAliases, '@lvce-editor/api': join(assets, 'api.js') },
      bundle: true,
      entryPoints: [join(packageRoot, 'src/main.ts')],
      format: 'esm',
      inject: browserInject,
      loader: { '.css': 'text' },
      outfile: join(outputRoot, 'samples', sample.id, 'main.js'),
      platform: 'browser',
      target: 'es2022',
    })
    const route = join(outputRoot, sample.route)
    await mkdir(route, { recursive: true })
    await writeFile(join(route, 'index.html'), createHtml(sample, true, assetDir, runtimeConfig))
  }
  await writeFile(join(outputRoot, 'index.html'), createHtml(samples[0], false, assetDir, runtimeConfig))
  await writeFile(join(outputRoot, '404.html'), createHtml(samples[0], false, assetDir, runtimeConfig))
  const outputSamples = await Promise.all(
    samples.map(async (sample) => {
      if (!sample.previewFilesPath || !sample.preview) return sample
      const { previewFilesPath, ...outputSample } = sample
      const previewFiles = JSON.parse(await readFile(join(root, 'packages', sample.packageName, previewFilesPath), 'utf8'))
      return { ...outputSample, preview: { ...sample.preview, files: previewFiles } }
    }),
  )
  await writeJson(join(outputRoot, 'samples.json'), outputSamples)
  await writeFile(join(outputRoot, '.nojekyll'), '')
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) await buildStatic()
