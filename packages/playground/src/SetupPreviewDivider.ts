export const setupPreviewDivider = (): void => {
  const pair = document.querySelector<HTMLElement>('.IdePair')!
  const divider = document.querySelector<HTMLElement>('#preview-divider')!
  let percentage = 50
  let pointerId: number | undefined
  const resize = (value: number): void => {
    percentage = Math.max(20, Math.min(80, value))
    pair.style.gridTemplateColumns = `minmax(0, ${percentage}fr) 6px minmax(0, ${100 - percentage}fr)`
    divider.ariaValueNow = String(Math.round(percentage))
  }
  const resizeFromPointer = (event: PointerEvent): void => {
    const { left, width } = pair.getBoundingClientRect()
    const dividerWidth = divider.getBoundingClientRect().width
    if (width > dividerWidth) resize(((event.clientX - left - dividerWidth / 2) / (width - dividerWidth)) * 100)
  }
  divider.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || pointerId !== undefined) return
    event.preventDefault()
    ;({ pointerId } = event)
    divider.setPointerCapture(pointerId)
    divider.focus()
    pair.classList.add('IdePairResizing')
  })
  divider.addEventListener('pointermove', (event) => {
    if (event.pointerId === pointerId) resizeFromPointer(event)
  })
  const stopResizing = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) return
    pointerId = undefined
    pair.classList.remove('IdePairResizing')
    if (divider.hasPointerCapture(event.pointerId)) divider.releasePointerCapture(event.pointerId)
  }
  divider.addEventListener('pointerup', stopResizing)
  divider.addEventListener('pointercancel', stopResizing)
  divider.addEventListener('lostpointercapture', stopResizing)
  divider.addEventListener('dblclick', () => resize(50))
  divider.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowLeft':
        resize(percentage - 2)
        break
      case 'ArrowRight':
        resize(percentage + 2)
        break
      case 'End':
        resize(80)
        break
      case 'Home':
        resize(20)
        break
      default:
        return
    }
    event.preventDefault()
  })
}
