# Color Picker

Open the editor color picker automatically with an initial color and edit the current document.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/color-picker/). The picker opens automatically and starts at `#ff8800`. Move its controls to change the color in the editable `#112233` literal. Escape closes the picker. To open it again, focus the preview editor, press F1, and run **Sample: Open Color Picker**.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The sample calls `await getActiveEditor()` to obtain `{ id, uri }`, or `undefined` when no editor is active. It then calls `openColorPicker(editor.id, '#ff8800')`. The editor id is required, and the initial color is optional. The picker targets that editor even if focus changes; invalid or closed editor ids are rejected.

```ts
const editor = await getActiveEditor()
if (editor) {
  await openColorPicker(editor.id, '#ff8800')
}
```
