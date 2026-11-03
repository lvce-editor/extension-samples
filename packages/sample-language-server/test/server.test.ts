// cspell:ignore sproutlsp
import { expect, test } from '@jest/globals'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import Path from 'node:path'

const contentLengthPattern = /Content-Length: (\d+)/

const message = (value: unknown): string => {
  const body = JSON.stringify(value)
  return `Content-Length: ${String(Buffer.byteLength(body))}\r\n\r\n${body}`
}

test('native server answers initialize and completion, frames Unicode output in bytes, and shuts down', async () => {
  const child = spawn(process.execPath, [Path.resolve(import.meta.dirname, '../src/server.ts')], { stdio: 'pipe' })
  const chunks: Buffer[] = []
  const errors: Buffer[] = []
  child.stdout.on('data', (chunk: Buffer) => {
    chunks.push(chunk)
  })
  child.stderr.on('data', (chunk: Buffer) => {
    errors.push(chunk)
  })
  const exited = once(child, 'exit')
  try {
    const input = [
      message({ id: 1, jsonrpc: '2.0', method: 'initialize', params: {} }),
      message({ jsonrpc: '2.0', method: 'initialized', params: {} }),
      message({
        id: 'completion-\u{E9}',
        jsonrpc: '2.0',
        method: 'textDocument/completion',
        params: { position: { character: 0, line: 0 }, textDocument: { uri: 'file:///example.sproutlsp' } },
      }),
      message({ id: 3, jsonrpc: '2.0', method: 'shutdown' }),
      message({ jsonrpc: '2.0', method: 'exit' }),
    ].join('')
    child.stdin.write(input.slice(0, 12))
    child.stdin.end(input.slice(12))
    const [code] = (await exited) as [number]
    expect(Buffer.concat(errors).toString()).toBe('')
    expect(code).toBe(0)
    let output = Buffer.concat(chunks)
    const responses: unknown[] = []
    while (output.length > 0) {
      const end = output.indexOf('\r\n\r\n')
      expect(end).toBeGreaterThan(0)
      const length = Number(contentLengthPattern.exec(output.subarray(0, end).toString())?.[1])
      const body = output.subarray(end + 4, end + 4 + length)
      responses.push(JSON.parse(body.toString()))
      output = output.subarray(end + 4 + length)
    }
    expect(responses).toEqual([
      {
        id: 1,
        jsonrpc: '2.0',
        result: { capabilities: { completionProvider: {}, textDocumentSync: 1 }, serverInfo: { name: 'Sprout sample', version: '1.0.0' } },
      },
      {
        id: 'completion-\u{E9}',
        jsonrpc: '2.0',
        result: [{ detail: 'A completion from the Sprout language server', insertText: 'helloFromServer', kind: 6, label: 'helloFromServer' }],
      },
      // eslint-disable-next-line unicorn/no-null -- JSON-RPC requires a null shutdown result.
      { id: 3, jsonrpc: '2.0', result: null },
    ])
  } finally {
    child.kill()
  }
})
