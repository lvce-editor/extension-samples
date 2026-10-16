import { activate, registerView, type VirtualDomViewInstance } from '@lvce-editor/api'

const Div = 4
const Text = 12

const main = async (): Promise<void> => {
  await activate()
  registerView({
    create(): VirtualDomViewInstance {
      return {
        render(): ReturnType<VirtualDomViewInstance['render']> {
          return [
            { childCount: 1, className: 'FileViewGreeting', role: 'status', type: Div },
            { childCount: 0, text: 'Hello from a custom file view!', type: Text },
          ]
        },
      }
    },
    id: 'sample.file-view',
    kind: 'virtualDom',
    title: 'Hello File',
  })
}

main()
