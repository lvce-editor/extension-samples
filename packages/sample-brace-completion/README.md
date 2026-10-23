# Brace Completion

Insert matching braces for parentheses, brackets, and curly braces.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/brace-completion/). Focus the editor, place the cursor after `word`, and run **Sample: Complete Brace** from F1. The editor inserts the matching closing brace.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

This isolated extension awaits `activate()` before registering its provider and command. The command calls the editor's built-in action so the edit uses normal editor behavior and undo history.
