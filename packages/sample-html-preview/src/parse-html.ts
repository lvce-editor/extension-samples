import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { DefaultTreeAdapterMap } from 'parse5'
import { VirtualDomElements } from '@lvce-editor/constants'
import { parseFragment } from 'parse5'

type Node = DefaultTreeAdapterMap['childNode']
type ElementNode = DefaultTreeAdapterMap['element']

const elementTypes: Readonly<Record<string, number>> = {
  a: VirtualDomElements.A,
  article: VirtualDomElements.Article,
  aside: VirtualDomElements.Aside,
  blockquote: VirtualDomElements.BlockQuote,
  button: VirtualDomElements.Button,
  code: VirtualDomElements.Code,
  div: VirtualDomElements.Div,
  em: VirtualDomElements.Em,
  h1: VirtualDomElements.H1,
  h2: VirtualDomElements.H2,
  h3: VirtualDomElements.H3,
  header: VirtualDomElements.Header,
  img: VirtualDomElements.Img,
  li: VirtualDomElements.Li,
  main: VirtualDomElements.Main,
  ol: VirtualDomElements.Ol,
  p: VirtualDomElements.P,
  section: VirtualDomElements.Section,
  span: VirtualDomElements.Span,
  strong: VirtualDomElements.Strong,
  ul: VirtualDomElements.Ul,
}

const allowedAttributes = new Set(['alt', 'class', 'href', 'id', 'src', 'title'])
interface ConvertedChildren {
  readonly childCount: number
  readonly nodes: VirtualDomNode[]
}

const toAttributes = (attributes: ElementNode['attrs']): Record<string, unknown> => {
  const result: Record<string, unknown> = {}
  for (const attribute of attributes) {
    const isSafeUrl = (attribute.name !== 'href' && attribute.name !== 'src') || !/^\s*javascript:/i.test(attribute.value)
    if (allowedAttributes.has(attribute.name) && isSafeUrl) {
      result[attribute.name === 'class' ? 'className' : attribute.name] = attribute.value
    }
  }
  return result
}

const convertElement = (element: ElementNode, errors: string[]): ConvertedChildren | undefined => {
  const type = elementTypes[element.tagName]
  if (type === undefined) {
    errors.push(`Unsupported HTML element: ${element.tagName}`)
    return undefined
  }
  const children = convert(element.childNodes, errors)
  return {
    childCount: 1,
    nodes: [{ childCount: children.childCount, type, ...toAttributes(element.attrs) }, ...children.nodes],
  }
}

const convertChild = (child: Node, errors: string[]): ConvertedChildren | undefined => {
  if ('tagName' in child) return convertElement(child, errors)
  if ('value' in child) {
    return {
      childCount: 1,
      nodes: [{ childCount: 0, text: child.value, type: VirtualDomElements.Text }],
    }
  }
  return undefined
}

const convert = (children: readonly Node[], errors: string[]): ConvertedChildren => {
  const nodes: VirtualDomNode[] = []
  let childCount = 0
  for (const child of children) {
    const converted = convertChild(child, errors)
    if (converted) {
      nodes.push(...converted.nodes)
      childCount += converted.childCount
    }
  }
  return { childCount, nodes }
}

export interface HtmlParseResult {
  readonly dom: readonly VirtualDomNode[]
  readonly error: string
}

export const parseHtml = (html: string): HtmlParseResult => {
  const errors: string[] = []
  const fragment = parseFragment(html, {
    onParseError(error) {
      errors.push(error.code)
    },
  })
  const { nodes: dom } = convert(fragment.childNodes, errors)
  return {
    dom,
    error: errors.length > 0 ? `Invalid or unsupported HTML: ${errors[0] ?? 'parse-error'}` : '',
  }
}
