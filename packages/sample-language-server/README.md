# Language Server

A native desktop example. It registers a small Node-compatible language server using LSP over standard input and output. Hovering over code in `example.sproutlsp` shows a message supplied by the server process.

From the repository root, install the pinned Node version and dependencies, then build:

```sh
npm ci
npm run build --workspace=packages/sample-language-server
lvce --transient --link ./packages/sample-language-server ./packages/sample-language-server
```

Use an installed LVCE release with `lvce` available on your PATH. Open `example.sproutlsp` and hover over `greeting`. The expected result is **Hello from the Sprout language server. 🌱**. Change the response in `src/server.ts`, rebuild, close the test window and relaunch to try your change.

`--transient` isolates this run's settings and installed extensions. `--link` loads this extension for the run. The manifest advertises the language and server; `src/main.ts` registers its relative executable URI. LVCE resolves the URI against the extension folder and runs `.mjs` servers with its Node runtime.

This example intentionally has a fixed hover response. It demonstrates a real server connection, not a language parser. The server handles initialize, hover, shutdown, and exit, and reads byte-framed messages, including split input and Unicode output. It does not run in the static browser playground because that environment cannot spawn a native process.
