import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { buildStatic } from './build.ts'

const root = resolve(import.meta.dirname, '../../..')
const outputRoot = join(root, '.tmp', 'static')
const port = Number.parseInt(process.env.PORT || '3000')

const contentTypes: Readonly<Record<string, string>> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.ts': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
}

if (process.env.SKIP_STATIC_BUILD !== '1') {
  await buildStatic()
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host}`)
    const pathWithoutPrefix = url.pathname.replace(/^\/extension-samples(?:\/|$)/, '/')
    const decodedPath = decodeURIComponent(pathWithoutPrefix)
    const relativePath = normalize(decodedPath).replace(/^(\.\.(\/|\\|$))+/, '')
    let absolutePath = join(outputRoot, relativePath)
    const fileStat = await stat(absolutePath)
    if (fileStat.isDirectory()) {
      absolutePath = join(absolutePath, 'index.html')
    }
    if (!absolutePath.startsWith(outputRoot)) {
      throw new Error('Path escapes static root')
    }
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': contentTypes[extname(absolutePath)] || 'application/octet-stream',
    })
    createReadStream(absolutePath).pipe(response)
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not found')
  }
}).listen(port, () => {
  console.log(`Extension samples: http://localhost:${port}/extension-samples/file-system-provider/`)
})
