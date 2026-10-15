# Definition Provider

Jump to a variable declaration and list its references.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/definition-provider/). The cursor starts on `color` in `print(color)`. Press F12 or use **Go to Definition** in the editor context menu to jump to `let color = blue`. Try `missing` to see the no-definition result. Declarations can be moved or edited; their offsets are computed from the current document.

Use **Find All References** to list the declaration and complete identifier uses in the preview sidebar. Click a result to select its range; names such as `colorful` are distinct from `color`.

Edit the TypeScript source or `extension.json` and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The isolated extension awaits `activate()` before registering its providers and commands. Its manifest declares `onDefinition:plaintext` so the runtime can discover the provider. `provideDefinition` returns a URI and start/end offsets, or `undefined` for unknown symbols. This tiny language uses document-wide declarations rather than full programming-language scoping.

`registerReferenceProvider` uses `onReferences:plaintext` and returns document-wide identifier locations, with offsets, line/column ranges, and preview text from the current document. The runtime combines these with definition results and removes duplicate locations.
