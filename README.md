# Extension Samples

Interactive examples for the [Lvce Editor](https://github.com/lvce-editor/lvce-editor) extension API.

Each extension lives in `packages/sample-<id>`. The static playground loads its TypeScript source, bundles it in the browser with esbuild-wasm, and runs it in a sandboxed preview. Saving with `Ctrl+S` or the Save button rebuilds the extension and refreshes the preview.

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

The browser compiler maps `@lvce-editor/api` to a small preview adapter. This keeps the playground fully static and makes extension code immediately runnable without a server. The sample source and manifests use the real Lvce Editor API package and can also be packaged as regular extensions. A future embeddable Lvce workbench can replace the adapter without changing the sample packages.
