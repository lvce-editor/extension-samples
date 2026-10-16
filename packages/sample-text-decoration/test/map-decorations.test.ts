import { expect, test } from '@jest/globals'
import { mapEditorTextDecorations } from '../src/map-decorations.js'

const underline = { color: '#ff0000', endColumnIndex: 5, endRowIndex: 0, startColumnIndex: 0, startRowIndex: 0, thickness: 2 }

test('keeps a decoration when text is appended after it', () => {
  expect(mapEditorTextDecorations('hello', 'hello\n', [underline])).toEqual([underline])
})

test('moves a decoration with text after insertion and deletion before it', () => {
  const decoration = { ...underline, endRowIndex: 1, startRowIndex: 1 }
  expect(mapEditorTextDecorations('top\nhello', 'new\ntop\nhello', [decoration])).toEqual([{ ...decoration, endRowIndex: 2, startRowIndex: 2 }])
  expect(mapEditorTextDecorations('new\ntop\nhello', 'top\nhello', [{ ...decoration, endRowIndex: 2, startRowIndex: 2 }])).toEqual([decoration])
})

test('drops a decoration when an edit touches its text', () => {
  expect(mapEditorTextDecorations('hello', 'heLlo', [underline])).toEqual([])
  expect(mapEditorTextDecorations('hello', 'hello!', [{ ...underline, endColumnIndex: 5, startColumnIndex: 1 }])).toEqual([
    { ...underline, endColumnIndex: 5, startColumnIndex: 1 },
  ])
})

test('maps columns as UTF-16 offsets', () => {
  const decoration = { ...underline, endColumnIndex: 4, startColumnIndex: 2 }
  expect(mapEditorTextDecorations('😀abc', 'x\n😀abc', [decoration])).toEqual([{ ...decoration, endRowIndex: 1, startRowIndex: 1 }])
})
