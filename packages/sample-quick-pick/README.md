# Quick Pick

Choose custom items with labels, descriptions, icons, and distinct values.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/quick-pick/). Focus the preview editor, press F1, and run **Sample: Choose Environment**. Filter or select an item. The extension writes its distinct value (for example, `staging`) to `environment.txt` and opens it. Escape cancels without writing a file.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The isolated extension awaits `activate()` before registering its provider or command. `extension.json` declares the matching contribution IDs. File paths are resolved against the current workspace URI.
