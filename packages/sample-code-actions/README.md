# Code Actions

Organize a block of imports with a source code action.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/code-actions/). Focus the preview editor, press **Shift+Alt+O** to run **Organize Imports**. The action sorts the leading `import name` lines while preserving the body. Ctrl+Z undoes it. This is a tiny sample language, not a JavaScript import parser; it demonstrates `source.organizeImports` through the code actions provider.

Edit the TypeScript source or `extension.json` and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The isolated extension awaits `activate()` before registering its providers and commands. Its manifest declares the contributions and activation events.
