# Output Channel

Write, append, and clear simulated build logs in the Output panel.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/output-channel/). The Output panel opens with a welcome line in **Sample Build**. Focus the preview editor, press F1, and run **Sample: Run Build**. Each run appends a numbered simulated build. Run **Sample: Clear Build Output** to clear the log.

Edit the TypeScript source or `extension.json` and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

`extension.json` contributes the `sample-build` channel with the label **Sample Build**. The extension creates that channel once with `createOutputChannel()` before `activate()`, then writes only after activation. Repeated command runs reuse the same channel.

`appendLine()` adds a line, `append()` continues the current line, and `clear()` removes the log. After writing, `openOutputView({ channel: 'sample-build' })` shows the channel with its latest contents.
