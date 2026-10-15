import type { SignatureHelpProvider } from '@lvce-editor/api'

const call = /mix\(([^()]*)$/

export const provideSignatureHelp: SignatureHelpProvider['provideSignatureHelp'] = ({ text }, offset) => {
  const match = call.exec(text.slice(0, offset))
  if (!match) return undefined
  return {
    activeParameter: Math.min((match[1] ?? '').split(',').length - 1, 1),
    activeSignature: 0,
    signatures: [
      {
        documentation: 'Combine two named colors.',
        label: 'mix(first, second)',
        parameters: [
          { documentation: 'The first color to mix.', label: 'first' },
          { documentation: 'The second color to mix.', label: 'second' },
        ],
      },
    ],
  }
}
