import {
  activate,
  executeCommand,
  registerBraceCompletionProvider,
  registerClosingTagProvider,
  registerCommand,
  registerCommentProvider,
  registerSelectionProvider,
  registerTabCompletionProvider,
} from '@lvce-editor/api'

interface TextDocument {
  readonly text: string
}
const openTag = /<([a-z][a-z0-9]*)>[^<>]*<$/i
const braces = new Set(['(', '[', '{'])

const ready = activate().then(() => {
  registerBraceCompletionProvider({
    id: 'sample-braces',
    languageId: 'plaintext',
    provideBraceCompletion(_document: TextDocument, _offset: number, text: string) {
      return braces.has(text)
    },
  })
  registerClosingTagProvider({
    id: 'sample-closing-tags',
    languageId: 'plaintext',
    provideClosingTag({ text }: TextDocument, offset: number, typed: string) {
      const tag = openTag.exec(text.slice(0, offset))?.[1]
      return typed === '/' && tag ? { inserted: `/${tag}>` } : undefined
    },
  })
  registerCommentProvider({
    id: 'sample-comments',
    languageId: 'plaintext',
    provideComment() {
      return ['/*', '*/']
    },
  })
  registerSelectionProvider({
    id: 'sample-selections',
    languageId: 'plaintext',
    provideSelections({ text }: TextDocument, selections: readonly number[]) {
      const lines = text.split('\n')
      const expanded: number[] = []
      for (let i = 0; i < selections.length; i += 4) {
        const row = selections[i] ?? 0
        expanded.push(row, 0, row, lines[row]?.length ?? 0)
      }
      return expanded
    },
  })
  registerTabCompletionProvider({
    id: 'sample-log-snippet',
    languageId: 'plaintext',
    provideTabCompletion({ text }: TextDocument, offset: number) {
      return text.slice(0, offset).endsWith('log') ? { deleted: 3, inserted: 'console.log($0)', type: 1 } : undefined
    },
  })
})

const commands = [
  { args: ['('], command: 'Editor.braceCompletion', id: 'sample.completeBrace' },
  { args: ['/'], command: 'Editor.typeWithAutoClosing', id: 'sample.closeTag' },
  { args: [], command: 'Editor.toggleBlockComment', id: 'sample.commentSelection' },
  { args: [], command: 'Editor.selectionGrow', id: 'sample.expandSelection' },
  { args: [], command: 'Editor.tabCompletion', id: 'sample.completeLog' },
]
for (const { args, command, id } of commands) {
  registerCommand({
    async execute() {
      await ready
      await executeCommand(command, ...args)
    },
    id,
  })
}
ready.catch(console.error)
