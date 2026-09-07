# Formatting Provider

Format key-value settings using document edits.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/formatting-provider/). Focus the preview editor and press F1 and run **Format Document**. Leading/trailing whitespace is removed and each equals sign gets one space on each side. Formatting an already formatted document returns no edits.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The isolated extension awaits `activate()` before registering its provider or command. `extension.json` declares the matching contribution IDs and the `.settings` language.
