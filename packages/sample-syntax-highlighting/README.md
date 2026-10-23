# Syntax Highlighting

This sample contributes syntax highlighting for **Sprout**, a tiny made-up language. Files ending in `.sprout` use the `sprout` language ID from `extension.json`. Its `languages` entry associates the file extension with `src/tokenizeSprout.js`.

Sprout recognizes `let`, `print`, and boolean keywords, quoted strings, decimal numbers, punctuation, and comments beginning with `//`. Other text stays unstyled. The tokenizer exports an initial line state, a token-to-style map, and `tokenizeLine`, which returns alternating token IDs and lengths covering the line.

Choose **Syntax Highlighting** in the playground and edit the example on the right to see highlighting update. Edit sample source on the left and save with Ctrl+S to rebuild the preview. The playground bundles tokenizer modules and their relative imports too. Rebuilding restores the preview document; **Reset sample** also discards saved source edits.
