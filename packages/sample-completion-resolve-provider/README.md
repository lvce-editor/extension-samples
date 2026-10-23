# Completion Resolve Provider

Suggest color names, then resolve the accepted item to a different inserted value.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/completion-resolve-provider/). Suggestions open after `color=blu`. The menu shows `blue`; press Enter to resolve and insert `#0000ff`. Escape closes suggestions without changing the document.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The initial provider supplies labels. `resolveCompletionItem` supplies the `snippet` that the completion worker inserts when the suggestion is accepted.
