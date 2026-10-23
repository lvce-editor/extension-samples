# Three Editors

Open a small HTML, CSS, and JavaScript example in three side-by-side editor columns with one extension API call.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/three-editors/), focus the preview editor, press F1, and run **Sample: Open Three Editors**. The sample creates each file only if it does not already exist, then opens the files left to right. Running the command again reuses the existing tabs and keeps the three-column layout.

## API

The sample calls `openUrisInThreeColumns([htmlUri, cssUri, jsUri])` once. The host establishes the three-column layout before opening the files in order. Existing files are preserved, and an individual file that cannot be opened appears in its column using the editor's normal error state.
