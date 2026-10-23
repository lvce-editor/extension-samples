import { activate, registerCommand, showNotification } from '@lvce-editor/api'
import { add } from 'lodash'

const main = async (): Promise<void> => {
  await activate()
  registerCommand({
    id: 'sample.addNumbers',
    async execute() {
      await showNotification('info', `2 + 3 = ${String(add(2, 3))}`)
    },
  })
}

main()
