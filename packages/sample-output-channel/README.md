# Output Channel

Write, append, and clear simulated build logs in the Output panel.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/output-channel/). The Output panel opens with a welcome line in **Sample Build**. Focus the preview editor, press F1, and run **Sample: Run Build**. Each run appends a numbered simulated build. Run **Sample: Clear Build Output** to clear the log.

Edit the TypeScript source or `extension.json` and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The manifest activates eagerly for the welcome line and on each command so commands reactivate the extension after a source reload.

`extension.json` contributes the `sample-build` channel with the label **Sample Build**. The extension creates that channel once with `createOutputChannel()` before `activate()`, then writes only after activation. Commands register immediately and await the shared activation promise before writing, so the first command after a source reload also works. Repeated command runs reuse the same channel.

`appendLine()` adds a line, `append()` continues the current line, and `clear()` removes the log. After writing, `openOutputView({ channel: 'sample-build' })` shows the channel with its latest contents.

Run **Sample: Cache Build Artifact** to write a temporary text blob with `setCacheStorageItem`, read its body with `getCacheStorageItem`, and delete it with `removeCacheStorageItem` in a `finally` block. The Output panel shows the read-back text and confirms the cache entry is gone. The key belongs to this extension’s cache and is reserved for this demonstration. Repeat the command to observe the same result without accumulating artifacts.

Run **Sample: Watch File Changes**, then **Sample: Write Watched File** to see an application-scoped file-change callback in Output. Starting again replaces and disposes the previous handler. **Sample: Stop Watching File Changes** disposes it; writing again produces only the write confirmation. This observes workspace change notifications through `registerFileChangeHandler`, rather than creating a native disk watcher. Reload/reset disposes the isolated extension and its registrations.

**Sample: Report Build Error** formats an example `Error` with `preparePrettyError` and writes its message to the channel. The helper preserves serialized error information when a host formatter is unavailable.
