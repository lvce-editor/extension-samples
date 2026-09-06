import * as esbuild from 'esbuild-wasm'

const initialized = esbuild.initialize({ wasmURL: new URL('esbuild.wasm', import.meta.url).href, worker: false })
const loadApi = async (): Promise<string> => {
  const response = await fetch(new URL('api.js', import.meta.url))
  if (!response.ok) throw new Error(`Unable to load the extension API: ${response.status}`)
  return response.text()
}
const apiSource = loadApi()
const getLoader = (path: string): esbuild.Loader => {
  if (path.endsWith('.json')) return 'json'
  if (path.endsWith('.ts')) return 'ts'
  return 'js'
}

onmessage = async (event: MessageEvent<{ files: Record<string, string>; id: number }>): Promise<void> => {
  const { files, id } = event.data
  try {
    await initialized
    const api = await apiSource
    const result = await esbuild.build({
      bundle: true,
      entryPoints: ['/src/main.ts'],
      format: 'esm',
      platform: 'browser',
      plugins: [
        {
          name: 'sample-workspace',
          setup(build): void {
            build.onResolve({ filter: /.*/ }, (args) => {
              if (args.path === '@lvce-editor/api') return { namespace: 'api', path: 'api' }
              if (args.importer && !args.path.startsWith('.')) {
                return { errors: [{ text: `Only relative imports and @lvce-editor/api are supported: ${args.path}` }] }
              }
              const path = new URL(args.path, `https://workspace${args.importer || '/'}`).pathname
              const match = [path, `${path}.ts`, `${path}.js`, `${path}/index.ts`].find((candidate) => candidate in files)
              return match ? { namespace: 'workspace', path: match } : { errors: [{ text: `File not found: ${path}` }] }
            })
            build.onLoad({ filter: /.*/, namespace: 'api' }, () => ({ contents: api, loader: 'js' }))
            build.onLoad({ filter: /.*/, namespace: 'workspace' }, ({ path }) => ({
              contents: files[path],
              loader: getLoader(path),
            }))
          },
        },
      ],
      target: 'es2022',
      write: false,
    })
    postMessage({ code: result.outputFiles[0].text, id })
  } catch (error) {
    postMessage({ error: String(error), id })
  }
}
