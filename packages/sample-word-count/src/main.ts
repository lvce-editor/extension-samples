import { activate, executeCommand, registerCommand, showNotification } from '@lvce-editor/api'
import { countWords } from './count-words.ts'

const main = async (): Promise<void> => {
  await activate()
  registerCommand({
    async execute() {
      const document = await executeCommand('GetActiveEditor.getTextDocument')
      if (!document || typeof document !== 'object' || !('text' in document) || typeof document.text !== 'string') {
        await showNotification('warning', 'No active editor to count.')
        return
      }
      const count = countWords(document.text)
      const word = count === 1 ? 'word' : 'words'
      await showNotification('info', `There ${count === 1 ? 'is' : 'are'} ${String(count)} ${word}.`)
    },
    id: 'sample.countWords',
  })
}

main()
