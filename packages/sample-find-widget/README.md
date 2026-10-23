# Find Widget

Open [the playground](https://lvce-editor.github.io/extension-samples/find-widget/). The preview automatically opens the find widget, enters `matching phrase`, and highlights its match in the preview document.

To run the example again, focus the preview editor, press F1, and run **Sample: Find Phrase**. The command updates the open find widget. The document stays unchanged. Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

The command uses `getWorkspaceUri` and `openUri` to open `example.txt`, opens its find widget, and gets the active preview editor ID. It sends `FindWidget.handleInput` through `Viewlet.executeViewletCommand` with the query and the script input flag (`2`), which updates both the input value and search results. Running it again updates the existing find widget.
