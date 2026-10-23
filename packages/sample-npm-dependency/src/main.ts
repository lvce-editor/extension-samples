import { activate, registerCommand, showNotification } from '@lvce-editor/api'
import { add } from 'lodash'

const main = async (): Promise<void> => {
  await activate()
  registerCommand({
    async execute() {
      await showNotification('info', `2 + 3 = ${String(add(2, 3))}`)
    },
    id: 'sample.addNumbers',
  })
}

main()
