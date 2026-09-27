import { expect, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import { parseHtml } from '../src/parse-html.ts'

test('parses nested elements, safe attributes, and text into virtual DOM', () => {
  expect(parseHtml('<section class="content"><h1 id="title">Hello &amp; welcome</h1><img src="photo.png" alt="Photo"></section>')).toEqual({
    dom: [
      { childCount: 2, className: 'content', type: VirtualDomElements.Section },
      { childCount: 1, id: 'title', type: VirtualDomElements.H1 },
      { childCount: 0, text: 'Hello & welcome', type: VirtualDomElements.Text },
      { alt: 'Photo', childCount: 0, src: 'photo.png', type: VirtualDomElements.Img },
    ],
    error: '',
  })
})

test('reports malformed markup and does not render unsupported elements', () => {
  expect(parseHtml('<div').error).toContain('Invalid or unsupported HTML')
  expect(parseHtml('<script>alert(1)</script>')).toEqual({ dom: [], error: 'Invalid or unsupported HTML: Unsupported HTML element: script' })
})
