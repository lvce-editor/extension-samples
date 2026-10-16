import type { EditorTextDecoration } from '@lvce-editor/api'

const getChange = (previousText: string, text: string): { start: number; previousEnd: number; end: number } => {
  let start = 0
  while (start < previousText.length && start < text.length && previousText[start] === text[start]) start++
  let previousEnd = previousText.length
  let end = text.length
  while (previousEnd > start && end > start && previousText[previousEnd - 1] === text[end - 1]) {
    previousEnd--
    end--
  }
  return { end, previousEnd, start }
}

const positionToOffset = (text: string, rowIndex: number, columnIndex: number): number => {
  const lines = text.split('\n')
  let offset = 0
  for (let row = 0; row < rowIndex && row < lines.length; row++) offset += (lines[row] ?? '').length + 1
  return offset + Math.min(columnIndex, lines[rowIndex]?.length ?? 0)
}

const offsetToPosition = (text: string, offset: number): { rowIndex: number; columnIndex: number } => {
  const lines = text.split('\n')
  let lineStart = 0
  for (let rowIndex = 0; rowIndex < lines.length; rowIndex++) {
    const line = lines[rowIndex] ?? ''
    const lineEnd = lineStart + line.length
    if (offset <= lineEnd || rowIndex === lines.length - 1) {
      return { columnIndex: Math.min(offset - lineStart, line.length), rowIndex }
    }
    lineStart = lineEnd + 1
  }
  return { columnIndex: 0, rowIndex: 0 }
}

export const mapEditorTextDecorations = (
  previousText: string,
  text: string,
  decorations: readonly EditorTextDecoration[],
): readonly EditorTextDecoration[] => {
  if (previousText === text) return decorations
  const { end, previousEnd, start } = getChange(previousText, text)
  const delta = end - previousEnd
  const isInsertion = start === previousEnd
  const mapped: EditorTextDecoration[] = []
  for (const decoration of decorations) {
    const decorationStart = positionToOffset(previousText, decoration.startRowIndex, decoration.startColumnIndex)
    const decorationEnd = positionToOffset(previousText, decoration.endRowIndex, decoration.endColumnIndex)
    if (previousEnd <= decorationStart) {
      const mappedStart = offsetToPosition(text, decorationStart + delta)
      const mappedEnd = offsetToPosition(text, decorationEnd + delta)
      mapped.push({
        ...decoration,
        endColumnIndex: mappedEnd.columnIndex,
        endRowIndex: mappedEnd.rowIndex,
        startColumnIndex: mappedStart.columnIndex,
        startRowIndex: mappedStart.rowIndex,
      })
      continue
    }
    if (start >= decorationEnd) {
      mapped.push(decoration)
      continue
    }
    if (isInsertion || (start < decorationEnd && previousEnd > decorationStart)) continue
  }
  return mapped
}
