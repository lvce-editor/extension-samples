import { activate, registerView, type VirtualDomViewInstance } from '@lvce-editor/api'
import css from './main.css'

// LVCE virtual DOM element IDs; text nodes are separate children.
const Button = 1
const Div = 4
const Text = 12

const main = async (): Promise<void> => {
  await activate()
  registerView({
    create(): VirtualDomViewInstance {
      // Each open file creates its own instance. Closing its tab discards this state.
      let count = 0
      return {
        getCss(): string {
          return css
        },
        handleEvent(event): void {
          if (event.type === 'click' && event.name === 'increment') count += 1
        },
        render(): ReturnType<VirtualDomViewInstance['render']> {
          return [
            { childCount: 2, className: 'FileViewCounter', type: Div },
            { childCount: 1, className: 'FileViewCounterButton', name: 'increment', onClick: 'handleClick', type: Button },
            { childCount: 0, text: 'Increment', type: Text },
            { childCount: 1, className: 'FileViewCounterValue', role: 'status', type: Div },
            { childCount: 0, text: `Count: ${String(count)}`, type: Text },
          ]
        },
      }
    },
    id: 'sample.file-view-counter',
    kind: 'virtualDom',
    title: 'File Counter',
  })
}

main()
