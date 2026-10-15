# Output Channel

Write, append, and clear simulated build logs in the Output panel.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/output-channel/). The Output panel opens with a welcome line. Focus the preview editor, press F1, and run **Sample: Run Build**. Each run appends a numbered simulated build. Run **Sample: Clear Build Output** to clear the log.

Edit the TypeScript source or `extension.json` and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The isolated extension awaits `activate()` before registering its providers and commands. Its manifest declares the contributions and activation events.
