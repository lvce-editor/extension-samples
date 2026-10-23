import { activate as activateExtensionApi, registerView, type VirtualDomViewInstance, VirtualDomElements } from '@lvce-editor/api'

const { Div, Input, Text } = VirtualDomElements
const defaultColor = '#f0f0f0'
const namedColors = new Set([
  'black',
  'blue',
  'coral',
  'cyan',
  'gold',
  'gray',
  'green',
  'magenta',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'tomato',
  'white',
  'yellow',
])
const hexColorPattern = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i

const isCssColor = (value: string): boolean => {
  return hexColorPattern.test(value) || namedColors.has(value.toLowerCase())
}

const main = async (): Promise<void> => {
  await activateExtensionApi()
  registerView({
    create(): VirtualDomViewInstance {
      let backgroundColor = defaultColor
      return {
        getCss(): string {
          return `
            .ColorView { min-height: 100%; padding: 16px; background-color: ${backgroundColor}; }
            .ColorViewInput { box-sizing: border-box; width: 100%; padding: 8px; }
            .ColorViewPreview { margin-top: 16px; }
          `
        },
        handleEvent(event): void {
          if (event.type !== 'input' || event.name !== 'color' || typeof event.value !== 'string') return
          const color = event.value.trim()
          if (color && isCssColor(color)) backgroundColor = color
        },
        render(): ReturnType<VirtualDomViewInstance['render']> {
          return [
            { childCount: 2, className: 'ColorView', type: Div },
            {
              ariaLabel: 'Background color',
              childCount: 0,
              className: 'ColorViewInput',
              inputType: 'text',
              name: 'color',
              onFocus: 'handleFocus',
              onInput: 'handleInput',
              type: Input,
              // Keep native edits intact while asynchronous input events update the background.
              value: defaultColor,
            },
            { childCount: 1, className: 'ColorViewPreview', role: 'status', type: Div },
            { childCount: 0, text: `Background: ${backgroundColor}`, type: Text },
          ]
        },
      }
    },
    id: 'sample.color-view',
    kind: 'virtualDom',
    preferredLocation: 'sideBar',
    title: 'Color',
  })
}

main()
