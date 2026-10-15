# Status Bar Item

Choose an environment from a clickable status bar item.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/status-bar-item/). Click **Environment: Development** in the preview status bar. Choose **Staging** or **Production** to update the label. Escape cancels without changing it. The command palette also offers **Sample: Select Environment**.

Edit the TypeScript source or `extension.json` and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The isolated extension registers its commands immediately and awaits `activate()` before registering its provider. The preview waits for provider initialization before opening the status bar. Its manifest declares the contributions and activation events.
