# Dialog

Show a warning dialog with a title, message, and dismiss button.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/dialog/). Focus the preview editor, press F1, and run **Sample: Show Warning Dialog**. A warning dialog appears with a warning icon, title, message, and **OK** button. Dismiss it with **OK** or the close button, then run the command again.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. Run the command again to see your changes. **Reset sample** restores the original source.

## API

The isolated extension awaits `activate()` before calling `registerCommand()`. The command ID matches the activation event and command contribution in `extension.json`. `executeCommand('Dialog.showWarning', options)` opens the editor's warning dialog. Customize `title`, `message`, and `confirmMessage` to change its contents.
