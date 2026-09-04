interface Sample {
  readonly id: string
  readonly route: string
  readonly title: string
}

const getElement = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector)
  if (!element) {
    throw new Error(`Missing element: ${selector}`)
  }
  return element
}

const { body } = document
const sampleId = body.dataset.sampleId || 'file-system-provider'
const routePrefix = body.dataset.routePrefix || '.'
const picker = getElement<HTMLSelectElement>('#sample-picker')
const resetButton = getElement<HTMLButtonElement>('#reset-button')
const frame = getElement<HTMLIFrameElement>('#workbench-frame')

const populatePicker = async (): Promise<void> => {
  const response = await fetch(`${routePrefix}/samples.json`)
  const samples = (await response.json()) as readonly Sample[]
  for (const sample of samples) {
    const option = document.createElement('option')
    option.value = sample.route
    option.textContent = sample.title
    option.selected = sample.id === sampleId
    picker.append(option)
  }
}

picker.addEventListener('change', () => {
  location.assign(`${routePrefix}/${picker.value}/`)
})

const reset = (): void => {
  frame.src = `${routePrefix}/workbench/${sampleId}/?sample=${sampleId}&reset=${Date.now()}`
}

resetButton.addEventListener('click', () => {
  reset()
})

await populatePicker()
