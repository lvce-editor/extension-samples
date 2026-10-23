# Npm Dependency

Use lodash from an npm dependency in an extension.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/npm-dependency/). The preview shows the result of adding two numbers with lodash. Edit `src/main.ts` and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

This sample declares `lodash` in its `package.json`. The static build bundles it into the extension, and the playground ships the same browser-compatible bundle so edited source can import it. Other npm packages and Node-only APIs are not available in the browser compiler.
