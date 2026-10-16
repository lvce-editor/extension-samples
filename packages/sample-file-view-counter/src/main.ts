import { activate, registerView, type VirtualDomViewInstance } from '@lvce-editor/api'

const Button = 1
const Div = 4
const Text = 12

const main = async (): Promise<void> => {
  await activate()
  registerView({
    create(): VirtualDomViewInstance {
      let count = 0
      return {
        getCss(): string {
          return '.FileViewCounter { display: flex; align-items: center; gap: 12px; padding: 16px; } .FileViewCounter button { cursor: pointer; padding: 6px 12px; }'
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
