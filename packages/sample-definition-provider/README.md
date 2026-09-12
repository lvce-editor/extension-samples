# Definition Provider

Jump from a variable reference to its declaration.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/definition-provider/). The cursor starts on `color` in `print(color)`. Press F12 or use **Go to Definition** in the editor context menu to jump to `let color = blue`. Try `missing` to see the no-definition result. Declarations can be moved or edited; their offsets are computed from the current document.

Edit the TypeScript source or `extension.json` and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The isolated extension awaits `activate()` before registering its providers and commands. Its manifest declares the contributions and activation events.
