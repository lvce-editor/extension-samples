type Invoke = (command: string, ...args: readonly unknown[]) => Promise<unknown>

export interface PlaygroundRuntime {
  readonly executeShortcut: Invoke
}

interface QueuedPointer {
  readonly button: number
  readonly buttons: number
  readonly kind: 'pointer'
  readonly type: string
  readonly x: number
  readonly y: number
}

interface QueuedKey {
  readonly altKey: boolean
  readonly application: string
  readonly code: string
  readonly ctrlKey: boolean
  readonly key: string
  readonly kind: 'key'
  readonly metaKey: boolean
  readonly shiftKey: boolean
}

interface QueuedText {
  readonly application: string
  readonly kind: 'text'
  readonly text: string
}

type QueuedInput = QueuedKey | QueuedPointer | QueuedText

const getInputText = (input: QueuedKey | QueuedText): string | undefined => {
  if (input.kind === 'text') return input.text
  if (input.ctrlKey || input.metaKey || input.altKey) return undefined
  if (input.key === 'Enter') return '\n'
  return input.key.length === 1 ? input.key : undefined
}

const replayKey = async (input: QueuedKey | QueuedText, runtime: PlaygroundRuntime): Promise<void> => {
  const root = document.querySelector<HTMLElement>(`#${input.application}-ide`)
  const editor = root?.querySelector<HTMLElement>(':scope .Editor[data-uid]')
  const target = root?.querySelector<HTMLElement>(':scope .EditorInput textarea')
  target?.focus()
  const text = getInputText(input)
  if (editor && text !== undefined) {
    await runtime.executeShortcut('Application.execute', input.application, 'Viewlet.executeViewletCommand', Number(editor.dataset.uid), 'type', text)
  } else {
    target?.dispatchEvent(new KeyboardEvent('keydown', { ...input, bubbles: true, cancelable: true }))
  }
}

const replayInputs = async (queued: readonly QueuedInput[], runtime: PlaygroundRuntime): Promise<void> => {
  for (const input of queued) {
    if (input.kind === 'pointer') {
      const target = document.elementFromPoint(input.x, input.y)
      target?.dispatchEvent(
        new MouseEvent(input.type, {
          bubbles: true,
          button: input.button,
          buttons: input.buttons,
          cancelable: true,
          clientX: input.x,
          clientY: input.y,
          view: document.defaultView,
        }),
      )
    } else {
      await replayKey(input, runtime)
    }
  }
}

/** Activate a build-time DOM snapshot without starting workers while it is read. */
export const deferPlayground = (start: () => Promise<PlaygroundRuntime>): void => {
  const snapshot = document.querySelector<HTMLElement>('[data-playground-snapshot]')
  const live = document.querySelector<HTMLElement>('[data-playground-live]')
  if (!snapshot || !live) throw new Error('Deferred playground requires a snapshot and a live root')
  const queued: QueuedInput[] = []
  const listeners = new AbortController()
  let activation: Promise<void> | undefined
  let application = 'source'
  let replaying = false

  const activate = (): void => {
    activation ||= (async (): Promise<void> => {
      try {
        document.body.dataset.playgroundState = 'loading'
        const runtime = await start()
        const ownsFocus = snapshot.contains(document.activeElement)
        snapshot.remove()
        live.style.visibility = ''
        replaying = true
        listeners.abort()
        if (ownsFocus) document.querySelector<HTMLElement>(`#${application}-ide .EditorInput textarea`)?.focus()
        await replayInputs(queued, runtime)
        document.body.dataset.playgroundState = 'live'
      } catch (error) {
        document.body.dataset.playgroundState = 'error'
        const message = document.createElement('p')
        message.setAttribute('role', 'alert')
        message.className = 'ActivationError'
        message.textContent = `The live example could not start. Reload the example to retry. ${String(error)}`
        document.body.append(message)
      }
    })()
  }

  const selectApplication = (target: EventTarget | null): void => {
    if (target instanceof Element) application = target.closest<HTMLElement>('[data-application]')?.dataset.application || application
  }
  for (const type of ['mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu']) {
    snapshot.addEventListener(
      type,
      (event) => {
        if (replaying) return
        const pointer = event as MouseEvent
        selectApplication(pointer.target)
        queued.push({ button: pointer.button, buttons: pointer.buttons, kind: 'pointer', type, x: pointer.clientX, y: pointer.clientY })
        pointer.preventDefault()
        activate()
      },
      { capture: true, signal: listeners.signal },
    )
  }
  snapshot.addEventListener(
    'focusin',
    (event) => {
      selectApplication(event.target)
      activate()
    },
    { signal: listeners.signal },
  )
  snapshot.addEventListener(
    'beforeinput',
    (event) => {
      if (!event.data || event.isComposing) return
      selectApplication(event.target)
      queued.push({ application, kind: 'text', text: event.data })
      event.preventDefault()
      activate()
    },
    { capture: true, signal: listeners.signal },
  )
  snapshot.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Tab' || event.isComposing || event.key === 'Process' || event.key === 'Dead') return
      selectApplication(event.target)
      queued.push({
        altKey: event.altKey,
        application,
        code: event.code,
        ctrlKey: event.ctrlKey,
        key: event.key,
        kind: 'key',
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
      })
      event.preventDefault()
      event.stopImmediatePropagation()
      activate()
    },
    { capture: true, signal: listeners.signal },
  )
}
