import { expect, test } from '@jest/globals'
import { getDiagnostics } from '../src/get-diagnostics.ts'

test('returns no diagnostics for empty or marker-free text', () => {
  expect(getDiagnostics('')).toEqual([])
  expect(getDiagnostics('TODOs and prefixedTODO are not whole-word markers')).toEqual([])
})

test('returns TODO diagnostics in text order with zero-based ranges and metadata', () => {
  expect(getDiagnostics('TODO TODO\nvalue=TODO\n')).toEqual([
    {
      columnIndex: 0,
      endColumnIndex: 4,
      endRowIndex: 0,
      message: 'Replace TODO with a setting value.',
      rowIndex: 0,
      source: 'sample-diagnostics',
      type: 'error',
    },
    {
      columnIndex: 5,
      endColumnIndex: 9,
      endRowIndex: 0,
      message: 'Replace TODO with a setting value.',
      rowIndex: 0,
      source: 'sample-diagnostics',
      type: 'error',
    },
    {
      columnIndex: 6,
      endColumnIndex: 10,
      endRowIndex: 1,
      message: 'Replace TODO with a setting value.',
      rowIndex: 1,
      source: 'sample-diagnostics',
      type: 'error',
    },
  ])
})

test('returns consistent results across repeated calls', () => {
  const text = 'TODO\nTODO'
  expect(getDiagnostics(text)).toEqual(getDiagnostics(text))
  expect(getDiagnostics('TODO')).toHaveLength(1)
})
