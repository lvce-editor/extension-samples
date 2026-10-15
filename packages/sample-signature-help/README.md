# Signature Help

Place the preview cursor inside the arguments of `mix(blue, green)`, press F1, and run **Sample: Show Parameter Help**. The hover shows `mix(first, second)` and documentation for the argument at the cursor. Move after the comma to show the second argument; outside the call no help is returned. Escape dismisses the hover.

`registerSignatureHelpProvider` receives the unsaved text and cursor offset. This small example recognizes `mix(...)` without nested calls, chooses its active parameter from the commas before the cursor, and supplies signature and parameter documentation. The command waits for provider registration before requesting the editor's signature-help widget.

Edit the provider source and save with Ctrl+S to reload it. **Reset sample** restores its original source.
