# Hello World

Show a Hello World notification.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/hello-world/). A **Hello World!** notification appears automatically in the preview when it starts. Run **Sample: Hello World** from the command palette to show it again.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview; the rebuilt preview shows the notification on activation. **Reset sample** restores the original source and rebuilds the preview.

## API

The playground's `.lvce/setup-preview.js` runs the contributed command after the preview loads and rebuilds. The isolated extension awaits `activate()` before registering that command. `showNotification('info', message)` displays an informational notification.
