interface Request {
  readonly id?: number | string
  readonly method?: string
}

const lengthPattern = /(?:^|\r\n)Content-Length:\s*(\d+)/i

const main = (): void => {
  let pending = Buffer.alloc(0)
  let length: number | undefined
  let isShutdown = false
  const headerSeparator = '\r\n\r\n'

  const respond = (id: number | string, result: unknown): void => {
    const body = JSON.stringify({ id, jsonrpc: '2.0', result })
    process.stdout.write(`Content-Length: ${String(Buffer.byteLength(body))}${headerSeparator}${body}`)
  }

  const handle = (request: Request): void => {
    if (request.method === 'exit') {
      process.exitCode = isShutdown ? 0 : 1
      process.stdin.destroy()
      return
    }
    if (request.id === undefined) return
    switch (request.method) {
      case 'initialize': {
        respond(request.id, {
          capabilities: { completionProvider: {}, textDocumentSync: 1 },
          serverInfo: { name: 'Sprout sample', version: '1.0.0' },
        })
        break
      }
      case 'shutdown': {
        isShutdown = true
        // eslint-disable-next-line unicorn/no-null -- JSON-RPC requires a null shutdown result.
        respond(request.id, null)
        break
      }
      case 'textDocument/completion': {
        respond(request.id, [
          { detail: 'A completion from the Sprout language server', insertText: 'helloFromServer', kind: 6, label: 'helloFromServer' },
        ])
        break
      }
      default: {
        const body = JSON.stringify({ error: { code: -32_601, message: 'Method not found' }, id: request.id, jsonrpc: '2.0' })
        process.stdout.write(`Content-Length: ${String(Buffer.byteLength(body))}${headerSeparator}${body}`)
      }
    }
  }

  process.stdin.on('data', (chunk: Buffer) => {
    pending = Buffer.concat([pending, chunk])
    while (pending.length > 0) {
      if (length === undefined) {
        const end = pending.indexOf(headerSeparator)
        if (end === -1) return
        const header = lengthPattern.exec(pending.subarray(0, end).toString())
        if (!header?.[1]) throw new Error('Missing Content-Length header')
        length = Number(header[1])
        pending = pending.subarray(end + headerSeparator.length)
      }
      if (pending.length < length) return
      const body = pending.subarray(0, length).toString()
      pending = pending.subarray(length)
      length = undefined
      handle(JSON.parse(body) as Request)
    }
  })
}

main()
