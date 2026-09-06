# File System Provider Sample

Registers a writable `sample-memfs` file system containing a welcome file and a source folder. The provider demonstrates directory reads, file reads and writes, deletion, and file rename.

Directory entries are inferred from file paths. This minimal provider does not retain empty folders or implement directory moves. Its data is reset whenever the preview extension is rebuilt.
