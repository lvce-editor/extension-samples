import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export const getEsbuildBinaryPath = (): string => {
  const platformPackage = `@esbuild/${process.platform}-${process.arch}`
  for (const path of [`${platformPackage}/bin/esbuild`, `${platformPackage}/bin/esbuild.exe`, `${platformPackage}/esbuild.exe`]) {
    try {
      return require.resolve(path)
    } catch {
      // Try the executable layout used by the next platform package.
    }
  }
  return require.resolve('esbuild/bin/esbuild')
}
