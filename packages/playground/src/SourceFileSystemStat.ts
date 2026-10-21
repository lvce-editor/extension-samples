export const modulesRoot = 'sample-source:///sample/node_modules'

export const generatedRoot = 'sample-source:///sample/dist'
export const binaryDirectories = [`${modulesRoot}/esbuild/bin`, `${modulesRoot}/.bin`]
export const isGenerated = (uri: string): boolean => uri === generatedRoot || uri.startsWith(`${generatedRoot}/`)
export const isBinary = (uri: string): boolean => binaryDirectories.some((directory) => uri === `${directory}/esbuild`)

const isBinaryDirectory = (uri: string): boolean => binaryDirectories.includes(uri)
const fileStat = { exists: true, type: 7 }
const directoryStat = { exists: true, type: 3 }
const missingStat = { exists: false, size: 0 }

export const getSourceFileStat = async (uri: string, statMemoryFileSystem: (uri: string) => Promise<unknown>): Promise<unknown> => {
  if (uri === generatedRoot || isBinaryDirectory(uri)) return directoryStat
  if (uri === `${generatedRoot}/main.js` || isBinary(uri)) return fileStat
  if (isGenerated(uri) || binaryDirectories.some((directory) => uri.startsWith(`${directory}/`))) return missingStat
  return statMemoryFileSystem(uri.replace('sample-source://', 'memfs://'))
}
