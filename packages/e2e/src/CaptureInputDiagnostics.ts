/* eslint-disable @typescript-eslint/unbound-method, unicorn/no-this-outside-of-class -- Temporary MessagePort observation preserves the original receiver. */
import type { Page } from '@playwright/test'

// Temporary capture for the macOS focus/shortcut investigation.
export const captureInputDiagnostics = async (page: Page): Promise<void> => {
  page.on('console', (message) => {
    if (message.text().startsWith('[DEBUG-e2e-focus]')) console.warn(message.text())
  })
  page.on('pageerror', (error) => console.warn('[DEBUG-e2e-focus] pageerror', error.message))
  await page.addInitScript(() => {
    const originalPostMessage = MessagePort.prototype.postMessage
    let portSequence = 0
    const ports = new WeakMap<MessagePort, number>()
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const capture = (direction: string, port: number, data: unknown): void => {
      const serialized = JSON.stringify(data)
      // eslint-disable-next-line regex/hoist-regex -- The init script must be self-contained.
      if (serialized && /KeyBindings|Focus|SourceActions|EditorMessage|showSourceActions/.test(serialized)) {
        console.warn('[DEBUG-e2e-focus]', direction, port, serialized.slice(0, 2000))
      }
    }
    // Observe the real command path without replacing or synthesizing input.
    MessagePort.prototype.postMessage = function (this: MessagePort, ...args: any[]): void {
      let port = ports.get(this)
      if (port === undefined) {
        port = ++portSequence
        ports.set(this, port)
        const currentPort = port
        this.addEventListener('message', (event) => capture('receive', currentPort, event.data))
      }
      capture('send', port, args[0])
      Reflect.apply(originalPostMessage, this, args)
    }

    // The init script is serialized into the browser and must be self-contained.
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const describe = (target: EventTarget | null): string => {
      if (!(target instanceof Element)) return target === null ? 'null' : 'non-element'
      return `${target.closest('[id$="-ide"]')?.id}:${target.tagName}.${target.className}`
    }
    for (const type of ['focusin', 'focusout', 'keydown', 'keyup', 'input', 'lvce-file-saved']) {
      globalThis.addEventListener(
        type,
        (event) => {
          const key = event as KeyboardEvent
          console.warn(
            '[DEBUG-e2e-focus]',
            JSON.stringify({
              active: describe(document.activeElement),
              ctrl: key.ctrlKey,
              detail: (event as CustomEvent).detail,
              key: key.key,
              meta: key.metaKey,
              target: describe(event.target),
              time: performance.now(),
              type,
            }),
          )
        },
        { capture: true },
      )
    }
  })
}
