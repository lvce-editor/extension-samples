import { activate as activateExtensionApi, registerView, type VirtualDomViewInstance } from '@lvce-editor/api'

// LVCE virtual DOM element IDs. Text nodes are separate from their parent elements.
const Button = 1
const Div = 4
const Text = 12

const main = async (): Promise<void> => {
  await activateExtensionApi()
  registerView({
    create(): VirtualDomViewInstance {
      let count = 0
      return {
        getCss(): string {
          return `
            .SidebarCounter { display: flex; flex-direction: column; gap: 16px; padding: 16px; }
            .SidebarCounterValue { font-size: 24px; text-align: center; }
            .SidebarCounterButtons { display: flex; gap: 8px; }
            .SidebarCounterButton { flex: 1; padding: 8px; cursor: pointer; }
          `
        },
        handleEvent(event): void {
          if (event.type !== 'click') return
          if (event.name === 'increment') count += 1
          else if (event.name === 'decrement') count -= 1
        },
        render(): ReturnType<VirtualDomViewInstance['render']> {
          // A flat, depth-first tree: childCount counts direct children only.
          return [
            { childCount: 2, className: 'SidebarCounter', type: Div },
            { ariaLive: 'polite', childCount: 1, className: 'SidebarCounterValue', role: 'status', type: Div },
            { childCount: 0, text: `Count: ${String(count)}`, type: Text },
            { childCount: 2, className: 'SidebarCounterButtons', type: Div },
            { childCount: 1, className: 'SidebarCounterButton', name: 'decrement', onClick: 'handleClick', type: Button },
            { childCount: 0, text: 'Decrement', type: Text },
            { childCount: 1, className: 'SidebarCounterButton', name: 'increment', onClick: 'handleClick', type: Button },
            { childCount: 0, text: 'Increment', type: Text },
          ]
        },
      }
    },
    id: 'sample.sidebar-counter',
    kind: 'virtualDom',
    preferredLocation: 'sideBar',
    title: 'Counter',
  })
}

main().catch(console.error)
