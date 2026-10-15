# Document Symbol Provider

Open the Document Symbols playground sample. The preview file contains `color=blue` and `size=large`. Place the cursor inside either setting name: the editor breadcrumb shows that declaration. Move outside the declaration to see only the file path. Edit a name and the breadcrumb follows the unsaved document.

`registerDocumentSymbolProvider` supplies symbols with document offsets and a selection range for each setting name. This example deliberately recognizes only lines starting with an identifier followed immediately by `=`. It enables breadcrumbs only in the isolated preview application. Saving source with Ctrl+S reloads the provider; Reset sample restores the original source.
