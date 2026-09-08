# Completion Provider

Suggest colors and insert the selected completion.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/completion-provider/). Suggestions open automatically after `color=` using `.lvce/setup-preview.js`. Choose a color and press Enter to insert it. Press Ctrl+Space to reopen suggestions, or type a prefix such as `gr` to filter them.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The isolated extension awaits `activate()` before registering its provider or command. `extension.json` declares the matching contribution IDs and targets the built-in `plaintext` language.
