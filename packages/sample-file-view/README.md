# File View

Show a virtual DOM view automatically when opening a file with the `.hello` extension.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/file-view/). The preview opens `welcome.hello` and shows **Hello from a custom file view!**. Open `notes.txt` from the preview Explorer to return to the normal text editor.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The manifest contributes a `virtualDom` view with `type: "preview"` and `selector: [".hello"]`. The matching `onView` activation event loads the isolated extension, which registers a view with the same ID. This example's view is created for matching files and renders a flat virtual DOM tree.
