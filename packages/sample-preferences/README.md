# Preferences

Read and update an editor preference with cancellation and an explicit reset command.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/preferences/). Focus the preview editor, press F1, and run **Sample: Set Font Size**. Choose a size to update `editor.fontSize`; Escape leaves the preference unchanged. Run **Sample: Reset Font Size** to restore the value captured when the sample activated. The Output panel shows the value returned by `getPreference`.

Edit the TypeScript source or `extension.json` and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The sample reads the user's current `editor.fontSize` before making changes and provides a reset command. It changes no preference when the picker is cancelled. In the playground test, Chromium's isolated browser profile keeps sample settings separate from the user's editor profile.
