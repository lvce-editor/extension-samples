import * as esbuild from 'esbuild-wasm'

const allPaths = /.*/
const relativePathPrefix = /^\.\//

const initialized = esbuild.initialize({ wasmURL: new URL('esbuild.wasm', import.meta.url).href, worker: false })
const loadApi = async (): Promise<string> => {
  const response = await fetch(new URL('api.js', import.meta.url))
  if (!response.ok) throw new Error(`Unable to load the extension API: ${response.status}`)
  return response.text()
}
const apiSource = loadApi()
const getLoader = (path: string): esbuild.Loader => {
  if (path.endsWith('.css')) return 'text'
  if (path.endsWith('.json')) return 'json'
  if (path.endsWith('.ts')) return 'ts'
  return 'js'
}

const getShippedPackagePath = (name: string, files: Record<string, string>): string | undefined => {
  const packagePath = `/node_modules/${name}/index.js`
  if (!['lodash', 'memfs'].includes(name) || !(packagePath in files)) return undefined
  try {
    const packageJson = JSON.parse(files['/package.json'])
    return packageJson.dependencies?.[name] ? packagePath : undefined
  } catch {
    // An invalid editable package.json should not make an undeclared dependency available.
    return undefined
  }
}

const buildOutput = async (files: Record<string, string>, api: string, inlineApi: boolean, entry = '/src/main.ts'): Promise<string> => {
  const result = await esbuild.build({
    bundle: true,
    entryPoints: [entry],
    format: 'esm',
    platform: 'browser',
    plugins: [
      {
        name: 'sample-workspace',
        setup(build): void {
          build.onResolve({ filter: allPaths }, (args) => {
            if (args.path === '@lvce-editor/api') return inlineApi ? { namespace: 'api', path: 'api' } : { external: true, path: args.path }
            if (args.path === 'memfs') {
              const packagePath = getShippedPackagePath(args.path, files)
              return packagePath
                ? { namespace: 'workspace', path: packagePath }
                : { errors: [{ text: 'Package is not shipped in the playground: memfs' }] }
            }
            if (args.importer && !args.path.startsWith('.')) {
              const packagePath = getShippedPackagePath(args.path, files)
              if (packagePath) return { namespace: 'workspace', path: packagePath }
              return { errors: [{ text: `Package is not shipped in the playground: ${args.path}` }] }
            }
            const path = new URL(args.path, `https://workspace${args.importer || '/'}`).pathname
            const match = [path, `${path}.ts`, `${path}.js`, `${path}/index.ts`].find((candidate) => candidate in files)
            return match ? { namespace: 'workspace', path: match } : { errors: [{ text: `File not found: ${path}` }] }
          })
          build.onLoad({ filter: allPaths, namespace: 'api' }, () => ({ contents: api, loader: 'js' }))
          build.onLoad({ filter: allPaths, namespace: 'workspace' }, ({ path }) => ({
            contents: files[path],
            loader: getLoader(path),
          }))
        },
      },
    ],
    target: 'es2022',
    write: false,
  })
  return result.outputFiles[0].text
}

onmessage = async (event: MessageEvent<{ files: Record<string, string>; id: number }>): Promise<void> => {
  const { files, id } = event.data
  try {
    await initialized
    const api = await apiSource
    const [code, generated] = await Promise.all([buildOutput(files, api, true), buildOutput(files, api, false)])
    const manifest = JSON.parse(files['/extension.json']) as { languages?: readonly { tokenize?: string }[] }
    const tokenizers: Record<string, string> = {}
    const languages = manifest.languages || []
    for (const language of languages) {
      if (language.tokenize)
        tokenizers[language.tokenize] = await buildOutput(files, api, true, `/${language.tokenize.replace(relativePathPrefix, '')}`)
    }
    postMessage({ code, generated, id, tokenizers })
  } catch (error) {
    postMessage({ error: String(error), id })
  }
}
