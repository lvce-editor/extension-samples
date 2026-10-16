# File View Counter

Render an interactive, per-file counter for files ending in `.count`.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/file-view-counter/). The preview opens `first.count`. Click **Increment** (or focus it and press Enter/Space), then open `second.count` from the preview Explorer: it starts at zero because each file view instance owns its state. Reopen `first.count` to see its count retained while its tab remains open. Closing the tab discards that view state. `notes.txt` continues to use the text editor.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source and a fresh preview.

## API

The manifest selects `.count` files for a `virtualDom` preview and activates the extension with the matching `onView` event. The registered view creates its own counter state for each file, handles the button's `click` event, and returns the updated flat virtual DOM after each interaction.
