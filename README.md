# Extension Samples

Interactive examples for the [Lvce Editor](https://github.com/lvce-editor/lvce-editor) extension API.

Each extension lives in `packages/sample-<id>`. The static playground opens its TypeScript source in a real LVCE Editor, transpiles it in the browser with esbuild-wasm, and activates it in an isolated extension host. Saving with `Ctrl+S` rebuilds the extension and refreshes the live LVCE preview.

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

The build exports a focused LVCE workbench for each sample and installs the released `builtin.eslint` web extension. The source workspace uses LVCE's built-in in-memory file system so syntax highlighting, diagnostics, editing, and saving follow the normal editor paths. The file-system sample's right editor uses the provider registered by the code on the left; the source-control sample opens LVCE's real source-control view.

The playground extension maps `@lvce-editor/api` to the active extension-host API, transpiles the single-file TypeScript sample with esbuild-wasm, and persists successful saves in browser storage. The generated site remains a static GitHub Pages artifact and does not require a development server at runtime.
