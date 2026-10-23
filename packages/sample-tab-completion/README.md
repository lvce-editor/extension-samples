# Tab Completion

Expand the `log` prefix into a `console.log()` snippet.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/tab-completion/). Place the cursor after `log` and run **Sample: Expand Log Snippet** from F1. The extension inserts `console.log()` and puts the cursor inside the parentheses.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

This isolated extension awaits `activate()` before registering its provider and command. The command calls the editor's built-in action so the edit uses normal editor behavior and undo history.
