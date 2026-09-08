# Extension Samples

Interactive examples for the [Lvce Editor](https://github.com/lvce-editor/lvce-editor) extension API.

[Open the playground](https://lvce-editor.github.io/extension-samples/).

Each extension lives in `packages/sample-<id>`. The static playground shows two real LVCE IDEs side by side: the sample workspace on the left and the running extension on the right. Saving with `Ctrl+S` bundles the workspace in the browser with esbuild-wasm and refreshes the preview.

## Samples

- [Hello World](./packages/sample-hello-world)
- [Dialog](./packages/sample-dialog)
- [File system provider](./packages/sample-file-system-provider)
- [Source control provider](./packages/sample-source-control-provider)
- [Diagnostic Provider](./packages/sample-diagnostic-provider)
- [Completion Provider](./packages/sample-completion-provider)
- [Hover Provider](./packages/sample-hover-provider)
- [Quick Pick](./packages/sample-quick-pick)
- [Formatting Provider](./packages/sample-formatting-provider)
- [Quick Input](./packages/sample-quick-input)

## Development

```sh
npm ci
npm run dev
```

Then open `http://localhost:3000/extension-samples/file-system-provider/`.

Use `npm run build:static` to create the GitHub Pages artifact in `.tmp/static` and `npm run e2e:headless` to test the live-editing flow.

Run `npm run knip` to check unused files, exports, and dependencies across every package, including build tooling, e2e tests, the playground, and each extension sample. Both PR and main-branch CI run this check. The command also runs a production export check so sample entry-point exports are checked without Knip's build-script exemptions.

New `packages/sample-*` workspaces are included automatically, with `src/main.ts` as the extension entry point. Knip checks other source files for unused code. Optional `.lvce/setup-preview.js` modules are also entry points; mark their dynamically called `setupPreview` export with `/** @public */`. Other unused entry-point exports are still reported.

Run `npm run lint` for repository checks, or `npm run lint --workspace=packages/sample-file-system-provider` (substitute any sample package) to lint one extension. Every `packages/sample-*` extension uses the shared `eslint.samples.config.js`: typescript-eslint's [strict type-checked rules](https://typescript-eslint.io/users/configs/#strict-type-checked) and [Unicorn's recommended rules](https://github.com/sindresorhus/eslint-plugin-unicorn). API abbreviations and explicit `undefined` values are allowed. Sample TypeScript projects also enable strict checking and checked indexed access.

The playground shares the strict syntax and Unicorn rules, including checks against explicit `any` and non-null assertions. Type-aware rules (such as unsafe values and unhandled promises) run in CI and local lint commands; they are disabled in the browser because the playground's virtual filesystem does not yet support TypeScript project loading. New samples should include a `tsconfig.json` covering all source files.

## Playground architecture

Both IDEs share one renderer and the UI workers; neither IDE is an iframe. Each application owns its layout, component UIDs, workspace, and extension services. Worker ID ranges do not overlap. Preview rebuilds reload the extension in place, preserving both IDEs' tabs, selection, and undo history and retaining the shared UI workers.

The source Explorer includes the complete sample, including `extension.json`, imported TypeScript files, and SVG decoration icons. TypeScript syntax highlighting and the released `builtin.eslint` web extension use normal LVCE editor paths. The build includes browser-compatible ESLint tooling in the source workspace; ESLint supplies diagnostics, while TypeScript retains its other language features. No package installation server is needed in the browser.

The build generates SHA-256 hashes of each sample’s shipped files and configures `eslint.ignoreHashes` before opening the source editor. Browsing unchanged samples does not start ESLint’s evaluation worker. Editing source, including restoring an edited draft, resumes normal linting; undoing back to the shipped content clears diagnostics. Hashes are regenerated from the shipped files on every build, never from saved drafts.

The compiler resolves relative workspace imports and `@lvce-editor/api`. Saving code, manifests, or SVG icons rebuilds the preview. Compile and missing-icon errors leave the last working preview visible. The file-system preview reads its workspace from the sample's registered provider; the source-control preview shows its real source-control view and decoration icons.

Saved workspace snapshots persist in browser storage when available; **Reset sample** restores the example. The generated site is a static GitHub Pages artifact. Arbitrary npm imports, Node-only APIs, and binary asset editing are not supported by the browser compiler.

Application isolation separates editor state and extension services; it is not a security sandbox for hostile code. Use the playground to experiment with code you trust.

## Preview setup

An extension sample can include an optional `.lvce/setup-preview.js` module exporting an async `setupPreview` function. The playground runs it after mounting the extension and opening the preview entry file. For example, the completion sample uses:

```js
export const setupPreview = async ({ openFile, setCursor, showCompletions }) => {
  await openFile('example.txt')
  await setCursor(0, 6)
  await showCompletions()
}
```

The supplied helpers operate on the preview IDE:

| Helper                    | Behavior                                                      |
| ------------------------- | ------------------------------------------------------------- |
| `openFile(path)`          | Open and focus a file relative to the preview workspace.      |
| `setCursor(line, column)` | Position the cursor using zero-based line and column indices. |
| `showCompletions()`       | Open suggestions at the cursor.                               |
| `showHover()`             | Show documentation at the cursor.                             |
| `openSideBar(name)`       | Open a sidebar view, such as `Source Control`.                |
| `openPanel(name)`         | Open a panel view, such as `Problems`.                        |

Await each helper so actions run in order. Setup modules are standalone browser JavaScript; relative imports and extension API imports are not supported. They run in the playground page, separately from the extension.

Setup runs once per page load, including **Reset sample**. Saving extension edits reloads the extension without rerunning setup or moving the user's cursor. To change setup, edit its file in the source Explorer, save, and reload the page. Saved setup changes persist with the sample workspace. Setup errors appear in the preview status. Samples without a setup module simply open their configured entry file.
