# Quick Input

Prompt for a name and write a greeting, with cancellation handling.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/quick-input/). Focus the preview editor, press F1, and run **Sample: Create Greeting**. Replace the initial value `World` with a name and press Enter. The extension writes and opens `greeting.txt`. Escape or an empty name leaves the workspace unchanged.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The isolated extension awaits `activate()` before registering its provider or command. `extension.json` declares the matching contribution IDs. File paths are resolved against the current workspace URI.
