# Type Definition Provider

Jump from a variable reference to the declaration of its annotated type.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/type-definition-provider/). The cursor starts on `color` in `print(color)`. Open the editor context menu and choose **Go to Type Definition** to jump to `type Color = string`. Try `missing` to see the no-type-definition result.

This tiny language uses document-wide declarations: `type Color = string` and `let color: Color = blue`. The provider reads the current document on each request, so moving declarations or changing annotations updates navigation. It demonstrates the API rather than parsing a full programming language.

Edit the TypeScript source or `extension.json` and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The isolated extension awaits `activate()` before calling `registerTypeDefinitionProvider`. The manifest declares `onTypeDefinition:plaintext` so the runtime can discover the provider. `provideTypeDefinition` returns a URI and start/end offsets, or `undefined` when the variable or type is unknown.
