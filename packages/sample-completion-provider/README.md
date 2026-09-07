# Completion Provider

Suggest colors and insert the selected completion.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/completion-provider/). Focus the preview editor, put the cursor after `color=`, and press Ctrl+Space. Choose a color and press Enter to insert it. Type a prefix such as `gr` to filter suggestions.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The isolated extension awaits `activate()` before registering its provider or command. `extension.json` declares the matching contribution IDs and the `.settings` language.
