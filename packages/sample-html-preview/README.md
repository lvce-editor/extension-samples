# Live HTML Preview

Open the playground sample, focus its HTML editor, press F1, and run **Sample: Open HTML Preview**. The HTML Preview sidebar parses the current unsaved editor text and renders supported elements in virtual DOM. Edits appear as you type. Malformed or unsupported markup displays an error, which clears when the markup is corrected.

The example polls `GetActiveEditor.getTextDocument` while its view is open because the extension API does not currently expose a text-document change event. The interval is cleared when the view closes. The small parser supports common text, heading, section, list, link, image, and inline formatting elements with a safe attribute allowlist; scripts and unsupported elements are not rendered.
