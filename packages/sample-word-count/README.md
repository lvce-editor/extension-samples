# Word Count

Count the words in the active preview document, following the [Atom word count package example](https://flight-manual.atom-editor.cc/hacking-atom/sections/package-word-count/).

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/word-count/). Focus the preview editor, press F1, and run **Sample: Count Words**. An informational notification shows the count for the current document. Edit the document, then run the command again to count the unsaved text. If no editor is open, a warning explains that there is nothing to count.

Words are sequences of non-whitespace characters. Spaces, tabs, and line breaks separate words. Empty and whitespace-only documents contain zero words.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source and preview document.

## API

The extension reads `GetActiveEditor.getTextDocument` through the application-scoped `executeCommand` API, so it counts the preview IDE's active document, including unsaved edits. It reports the result with `showNotification`.
