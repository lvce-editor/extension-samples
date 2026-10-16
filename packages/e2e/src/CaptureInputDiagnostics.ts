import type { Page } from '@playwright/test'

// Temporary capture for the macOS focus/shortcut investigation.
export const captureInputDiagnostics = async (page: Page): Promise<void> => {
  page.on('console', (message) => {
    if (message.text().startsWith('[DEBUG-e2e-focus]')) console.warn(message.text())
  })
  page.on('pageerror', (error) => console.warn('[DEBUG-e2e-focus] pageerror', error.message))
  await page.addInitScript(() => {
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
