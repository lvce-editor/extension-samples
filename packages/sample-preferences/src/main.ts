import {
  activate,
  createOutputChannel,
  getColorThemeNames,
  getConfigurationDefinitions,
  getPreference,
  openOutputView,
  registerCommand,
  setPreference,
  showQuickPick,
} from '@lvce-editor/api'

const preferenceKey = 'editor.fontSize'
const output = createOutputChannel('sample-preferences')

const main = async (): Promise<void> => {
  const originalFontSize = activate().then(() => getPreference(preferenceKey))
  const ready = originalFontSize.then((value) => output.appendLine(`Current ${preferenceKey}: ${String(value)}`))
  registerCommand({
    async execute() {
      await ready
      const fontSize = await showQuickPick({
        items: [12, 14, 16, 18, 24].map((value) => ({
          description: `Set the editor font size to ${String(value)} pixels`,
          label: String(value),
          value,
        })),
        placeholder: 'Choose an editor font size',
      })
      if (typeof fontSize !== 'number') return
      await setPreference(preferenceKey, fontSize)
      const currentFontSize = await getPreference(preferenceKey)
      await output.appendLine(`Updated ${preferenceKey}: ${String(currentFontSize)}`)
      await openOutputView({ channel: 'sample-preferences' })
    },
    id: 'sample.setFontSize',
  })
  registerCommand({
    async execute() {
      await ready
      await setPreference(preferenceKey, await originalFontSize)
      const currentFontSize = await getPreference(preferenceKey)
      await output.appendLine(`Restored ${preferenceKey}: ${String(currentFontSize)}`)
      await openOutputView({ channel: 'sample-preferences' })
    },
    id: 'sample.resetFontSize',
  })
  registerCommand({
    async execute() {
      await ready
      const [definitions, themes] = await Promise.all([getConfigurationDefinitions(), getColorThemeNames()])
      await output.appendLine(`Sample font size definition: ${JSON.stringify(definitions['sample.fontSize'])}`)
      await output.appendLine(`Color themes: ${String(themes.length)}`)
      await openOutputView({ channel: 'sample-preferences' })
    },
    id: 'sample.inspectConfiguration',
  })
  await ready
}

main()
