# Hover Provider with Markdown

Show formatted Markdown documentation from a hover provider.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/hover-provider-with-markdown/). Documentation for `blue` opens automatically using `.lvce/setup-preview.js`. It demonstrates **bold text**, `inline code`, and a list. Hovering `unknown` produces no result.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

The isolated extension awaits `activate()` before registering its provider. The provider returns a Markdown string in the `documentation` field for recognized words and no result for other words.
