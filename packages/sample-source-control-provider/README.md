# Source Control Provider Sample

Registers a source control provider with a memfs-backed workspace, SVG decoration icons, commit-message generation, and example add, discard, and commit handlers. The README and nested `src/main.ts` file are seeded in memory and initially appear as modified. Use the Discard action on a changed file to remove that file from the changes list.

The sample uses in-memory data rather than a Git repository. Open either changed file to read its contents. Edit `extension.json`, `icons/modified.svg`, or the provider source and save to update the preview.
