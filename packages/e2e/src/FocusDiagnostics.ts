/* eslint-disable unicorn/no-this-outside-of-class, @typescript-eslint/unbound-method */
// Browser instrumentation must be serialized with addInitScript and preserve the native focus receiver.
// cspell:ignore allmessages
import { test as base } from '@playwright/test'
import { writeFile } from 'node:fs/promises'

const unsafeFilename = /[^a-z\d]+/gi

export const test = base.extend<{ focusDiagnostics: void }>({
  focusDiagnostics: [
    async ({ page }, use, testInfo): Promise<void> => {
      await page.addInitScript(() => {
        // eslint-disable-next-line regex/hoist-regex -- addInitScript serializes this callback into the browser.
        const secretKey = /token|password|authorization|cookie/i
        const scope = globalThis as any
        const entries: unknown[] = []
        scope.___receivedMessages = entries
        const describe = (element: EventTarget | null): unknown => {
          if (!(element instanceof Element)) return null
          return {
            application: element.closest('[id$="-ide"]')?.id,
            class: element.className,
            connected: element.isConnected,
            tag: element.tagName,
            uid: element.closest<HTMLElement>('[data-uid]')?.dataset.uid,
          }
        }
        const record = (type: string, payload: unknown): void => {
          entries.push({
            active: describe(document.activeElement),
            payload,
            sequence: entries.length,
            timestamp: performance.now(),
            type,
            wallTime: Date.now(),
          })
        }
        scope.___recordReceivedMessage = (message: unknown): void => {
          try {
            const seen = new WeakSet()
            const payload = JSON.parse(
              JSON.stringify(message, (key, value) => {
                if (secretKey.test(key)) return '[redacted]'
                if (typeof value === 'bigint') return String(value)
                if (value instanceof Error) return { message: value.message, stack: value.stack }
                if (value && typeof value === 'object') {
                  if (seen.has(value)) return '[Circular]'
                  seen.add(value)
                }
                return value
              }),
            )
            record('rpc-received', { direction: 'worker->renderer-process', message: payload })
          } catch (error) {
            record('capture-error', String(error))
          }
        }
        const originalFocus = HTMLElement.prototype.focus
        HTMLElement.prototype.focus = function (options): void {
          record('focus-call', { stack: new Error('Focus call').stack, target: describe(this) })
          originalFocus.call(this, options)
          record('focus-return', describe(this))
        }
        for (const type of ['focusin', 'focusout', 'keydown', 'keyup', 'pointerdown', 'contextmenu']) {
          document.addEventListener(
            type,
            (event) => {
              const host = event.target instanceof Element ? event.target.closest<HTMLElement>('.IdeRoot') : null
              const geometry =
                event instanceof MouseEvent && host
                  ? {
                      host: host.getBoundingClientRect().toJSON(),
                      scrollLeft: host.scrollLeft,
                      workbench: host.querySelector('.Workbench')?.getBoundingClientRect().toJSON(),
                    }
                  : undefined
              record(type, {
                alt: event instanceof KeyboardEvent ? event.altKey : undefined,
                control: event instanceof KeyboardEvent ? event.ctrlKey : undefined,
                geometry,
                key: event instanceof KeyboardEvent ? event.key : undefined,
                meta: event instanceof KeyboardEvent ? event.metaKey : undefined,
                shift: event instanceof KeyboardEvent ? event.shiftKey : undefined,
                target: describe(event.target),
              })
            },
            { capture: true },
          )
        }
      })
      try {
        await use()
      } finally {
        let entries: unknown
        try {
          entries = await page.evaluate(() => (globalThis as any).___receivedMessages || [])
        } catch (error) {
          entries = [{ captureError: String(error) }]
        }
        const slug = testInfo.title.replaceAll(unsafeFilename, '-').toLowerCase()
        const path = testInfo.outputPath(`allmessages-${slug}-${process.env.E2E_ATTEMPT || 'local'}.json`)
        await writeFile(path, JSON.stringify(entries, null, 2))
        await testInfo.attach('focus-and-rpc-timeline', { contentType: 'application/json', path })
      }
    },
    { auto: true },
  ],
})

export { expect } from '@playwright/test'
