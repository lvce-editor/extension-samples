import * as esbuild from 'esbuild-wasm'
import { setFileSystemProvider, setSourceControlProvider } from './ProviderRouter.ts'

const state: { compilerPromise: Promise<void> | undefined } = {
  compilerPromise: undefined,
}

const initializeCompiler = (): Promise<void> => {
  state.compilerPromise ||= esbuild.initialize({
    wasmURL: new URL('esbuild.wasm', import.meta.url).href,
    worker: false,
  })
  return state.compilerPromise
}

const exposeExtensionApi = (): void => {
  Object.assign(globalThis, {
    __lvceExtensionSamplesApi: {
      activate: async (): Promise<void> => {},
      registerFileSystemProvider: setFileSystemProvider,
      registerSourceControlProvider: setSourceControlProvider,
    },
  })
}

export const compileAndActivate = async (sampleId: string, source: string): Promise<void> => {
  exposeExtensionApi()
  await initializeCompiler()
  const result = await esbuild.transform(source, {
    format: 'esm',
    loader: 'ts',
    sourcefile: `${sampleId}/main.ts`,
    target: 'es2022',
  })
  const moduleSuffix = '} from "@lvce-editor/api";'
  const moduleEnd = result.code.indexOf(moduleSuffix)
  const importStart = result.code.lastIndexOf('import {', moduleEnd)
  if (importStart === -1 || moduleEnd === -1) {
    throw new Error('The sample must import its extension APIs from @lvce-editor/api')
  }
  const imports = result.code
    .slice(importStart + 'import {'.length, moduleEnd)
    .split(',')
    .map((item) => item.trim().replaceAll(' as ', ': '))
    .filter(Boolean)
    .join(', ')
  const javascript = `${result.code.slice(0, importStart)}const { ${imports} } = globalThis.__lvceExtensionSamplesApi${result.code.slice(
    moduleEnd + moduleSuffix.length,
  )}`
  const AsyncFunction = Object.getPrototypeOf(async (): Promise<void> => {}).constructor as new (code: string) => () => Promise<void>
  await new AsyncFunction(javascript)()
}
