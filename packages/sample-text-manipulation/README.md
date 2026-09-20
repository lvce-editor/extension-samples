# Text Manipulation

Insert a string at the cursor or replace the current selection.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/text-manipulation/). Focus the preview editor, select part of the text, press F1, and run **Sample: Insert Text**. The selected text is replaced with `Hello, World!`; with an empty selection, the string is inserted at the cursor.

The command uses the active text editor and leaves other editors unchanged. The replacement is a normal editor edit, so **Undo** restores the selected text.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. Run the command again to see the updated extension. **Reset sample** restores the original source.

## API

The isolated extension awaits `activate()` before calling `registerCommand()`. The command calls the existing renderer command bridge's `Editor.type` command, so the insertion participates in the editor's undo history and follows the editor's normal selection behavior.
