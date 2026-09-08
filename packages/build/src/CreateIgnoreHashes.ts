import { createHash } from 'node:crypto'

export const createIgnoreHashes = (files: Readonly<Record<string, string>>): readonly string[] =>
  [...new Set(Object.values(files).map((text) => createHash('sha256').update(text, 'utf8').digest('hex')))].sort()
