# Hello World

Show a Hello World notification.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/hello-world/). Focus the preview editor, press F1, and run **Sample: Hello World**. A notification saying **Hello World!** appears in the preview.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. Run the command again to see your changes. **Reset sample** restores the original source.

## API

The isolated extension awaits `activate()` before calling `registerCommand()`. The command ID matches the activation event and command contribution in `extension.json`. `showNotification('info', message)` displays an informational notification.
