# Diagnostic Provider

Underline TODO markers and clear diagnostics when they are resolved.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/diagnostic-provider/). The preview opens `example.settings` with two TODO markers. Both have error underlines. Replace TODO with a value to clear its diagnostic; add another TODO to create a new diagnostic. Positions are zero-based rows and columns.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The isolated extension awaits `activate()` before registering its provider or command. `extension.json` declares the matching contribution IDs and the `.settings` language.
