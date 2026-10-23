# File System Provider Sample

Registers a writable `sample-memfs` file system containing a welcome file and a source folder. The provider demonstrates directory reads, file reads and writes, deletion, and file rename.

The provider uses the [`memfs`](https://www.npmjs.com/package/memfs) package and adapts its Node-style file system methods to the extension API. Directories, including empty directories, are retained, and renaming a directory moves its contents. Missing paths use `memfs` errors. Its data is reset whenever the preview extension is rebuilt.
