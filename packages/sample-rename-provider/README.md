# Rename Provider

Rename every matching identifier in a document.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/rename-provider/). The cursor starts on `color` in `print(color)`. Press F2, enter `shade`, and press Enter. All three `color` identifiers change, while `colorful` stays intact. Ctrl+Z undoes the rename; Escape cancels it. Names must be identifiers and cannot be `let` or `print`. This tiny language has document-wide identifiers with no scopes, strings, or comments.

Edit the TypeScript source or `extension.json` and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The isolated extension awaits `activate()` before registering its providers and commands. Its manifest declares the contributions and activation events.
