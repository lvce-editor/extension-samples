# Selection Expansion

Expand each selection to its full line.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/selection-expansion/). Place the cursor on the example line and run **Sample: Select Current Line** from F1. The current line becomes selected; typing replaces it.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

This isolated extension awaits `activate()` before registering its provider and command. The command calls the editor's built-in action so the edit uses normal editor behavior and undo history.
