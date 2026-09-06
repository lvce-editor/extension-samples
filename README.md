# Extension Samples

Interactive examples for the [Lvce Editor](https://github.com/lvce-editor/lvce-editor) extension API.

Each extension lives in `packages/sample-<id>`. The static playground shows two real LVCE IDEs side by side: the sample workspace on the left and the running extension on the right. Saving with `Ctrl+S` bundles the workspace in the browser with esbuild-wasm and refreshes the preview.

## Samples

- [File system provider](./packages/sample-file-system-provider)
- [Source control provider](./packages/sample-source-control-provider)

## Development

```sh
npm ci
npm run dev
```

Then open `http://localhost:3000/extension-samples/file-system-provider/`.

Use `npm run build:static` to create the GitHub Pages artifact in `.tmp/static` and `npm run e2e:headless` to test the live-editing flow.

## Playground architecture

Both IDEs share one renderer and the UI workers; neither IDE is an iframe. Each application owns its layout, component UIDs, workspace, and extension services. Worker ID ranges do not overlap. Preview rebuilds dispose only the preview application, preserving the source IDE's tabs, selection, and undo history and retaining the shared UI workers.

The source Explorer includes the complete sample, including `extension.json`, imported TypeScript files, and SVG decoration icons. TypeScript syntax highlighting and the released `builtin.eslint` web extension use normal LVCE editor paths. The build includes browser-compatible ESLint tooling in the source workspace; ESLint supplies diagnostics, while TypeScript retains its other language features. No package installation server is needed in the browser.

The compiler resolves relative workspace imports and `@lvce-editor/api`. Saving code, manifests, or SVG icons rebuilds the preview. Compile and missing-icon errors leave the last working preview visible. The file-system preview reads its workspace from the sample's registered provider; the source-control preview shows its real source-control view and decoration icons.

Saved workspace snapshots persist in browser storage when available; **Reset sample** restores the example. The generated site is a static GitHub Pages artifact. Arbitrary npm imports, Node-only APIs, and binary asset editing are not supported by the browser compiler.
