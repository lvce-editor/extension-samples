export const modulesRoot = 'sample-source:///sample/node_modules'

export const generatedRoot = 'sample-source:///sample/dist'
export const binaryDirectories = [`${modulesRoot}/esbuild/bin`, `${modulesRoot}/.bin`]
export const isGenerated = (uri: string): boolean => uri === generatedRoot || uri.startsWith(`${generatedRoot}/`)
const generatedFile = `${generatedRoot}/main.js`
const binaryFiles = binaryDirectories.map((directory) => `${directory}/esbuild`)
export const isBinary = (uri: string): boolean => binaryFiles.includes(uri)

const isBinaryDirectory = (uri: string): boolean => binaryDirectories.includes(uri)

export const getSourceFileStat = async (uri: string, statMemoryFileSystem: (uri: string) => Promise<number>): Promise<number> => {
  if (uri === generatedRoot || isBinaryDirectory(uri)) return 3
  if (uri === generatedFile || isBinary(uri)) return 7
  if (isGenerated(uri) || binaryDirectories.some((directory) => uri.startsWith(`${directory}/`))) {
    throw new Error(`File not found: ${uri}`)
  }
  return statMemoryFileSystem(uri.replace('sample-source://', 'memfs://'))
}
