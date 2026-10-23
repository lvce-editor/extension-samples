# Comments

Toggle block comments around the selected text.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/comments/). Select the example text and run **Sample: Toggle Sample Comment** from F1 to surround it with `/*` and `*/`. Run the command again to remove the comment.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

This isolated extension awaits `activate()` before registering its provider and command. The command calls the editor's built-in action so the edit uses normal editor behavior and undo history.
