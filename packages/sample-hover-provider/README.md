# Hover Provider

Show documentation for recognized color names.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/hover-provider/). Move the pointer over `blue`, `green`, or `red` in the preview to see its documentation. Hovering `unknown` produces no result.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The isolated extension awaits `activate()` before registering its provider or command. `extension.json` declares the matching contribution IDs and targets the built-in `plaintext` language.
