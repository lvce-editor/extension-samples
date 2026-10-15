# Error Dialog

Show an error dialog with a title, message, and dismiss button.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/error-dialog/). The error dialog appears automatically with an error icon, title, message, and **OK** button. Dismiss it with **OK** or the close button, then press F1 and run **Sample: Show Error Dialog** to open it again.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. Run the command again to see your changes. **Reset sample** restores the original source.

## API

The isolated extension awaits `activate()` before calling `registerCommand()`. The command ID matches the activation event and command contribution in `extension.json`. `executeCommand('Dialog.show', options)` opens the editor's dialog. Set `type` to `error` to show the error icon; customize `title`, `message`, and `confirmMessage` to change its contents.
