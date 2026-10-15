# Editor Decorations

Lines starting with `+`, `~`, or `-` receive the built-in added, modified, or deleted gutter bar. Click inside one of those lines to show a matching end-of-line label. Plain lines have no decoration. These markers are demonstration data, rather than a comparison with a repository revision.

The sample uses `registerEditorGutterDecorationProvider` for document-wide gutter marks and `registerEditorLineDecorationProvider` for the clicked row's label. Both read the unsaved text supplied by the editor and ignore other languages. Remove a marker and click the line again to clear its label and gutter mark.

Edit the provider in the source editor and save with Ctrl+S to reload it. **Reset sample** restores the original source. The preview application's registry is recreated during reload, so registering again does not duplicate its providers.
