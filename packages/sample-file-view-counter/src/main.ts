import { activate, registerView, type VirtualDomViewInstance } from '@lvce-editor/api'

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
          return `
.FileViewCounter {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: 16px;
  color: var(--vscode-foreground);
}
.FileViewCounter button {
  min-height: 36px;
  padding: 8px 16px;
  border: 1px solid var(--vscode-button-border, transparent);
  border-radius: 4px;
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  font: inherit;
  cursor: pointer;
}
.FileViewCounter button:hover {
  background: var(--vscode-button-hoverBackground);
}
.FileViewCounter button:active {
  transform: translateY(1px);
}
.FileViewCounter .FileViewCounterButton:focus-visible {
  outline-color: var(--vscode-focusBorder) !important;
  outline-style: solid !important;
  outline-width: 2px !important;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--vscode-focusBorder) !important;
}
.FileViewCounterValue {
  box-sizing: border-box;
  max-width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border, transparent));
  border-radius: 6px;
  background: var(--vscode-editor-inactiveSelectionBackground, var(--vscode-input-background));
  color: var(--vscode-foreground);
  font-size: 16px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
`
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
