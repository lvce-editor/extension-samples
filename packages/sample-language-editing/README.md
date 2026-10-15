# Language Editing

This small plaintext language demonstrates five independent provider contracts. Focus the preview editor and use F1 to run the commands at the current selection:

- **Sample: Complete Brace** inserts `()` through a brace-completion provider. Its provider approves `(`, `[`, and `{`; the editor supplies the matching closing brace.
- Put the cursor at the end of `<demo><` and run **Sample: Complete Closing Tag**. The closing-tag provider completes the slash to produce `<demo></demo>`. This uses the editor's auto-closing-tags setting.
- Select text and run **Sample: Toggle Sample Comment** to surround it with the provider's `/*` and `*/` delimiters. Run it again inside the comment to remove those delimiters.
- **Sample: Select Current Line** expands each cursor's selection to its entire line using the selection provider. Typing then replaces that line.
- Put the cursor after `log` and run **Sample: Expand Log Snippet** to replace that prefix with `console.log()` and place the cursor between the parentheses. Other prefixes are left unchanged.

These commands call the real editor actions after all providers are registered. The provider callbacks receive the unsaved document, so edits affect the next request. Undo restores text edits. Save the source with Ctrl+S to reload the providers; **Reset sample** restores the original source.
