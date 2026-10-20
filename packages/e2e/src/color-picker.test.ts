import { expect, test } from '@playwright/test'
import { runCommand } from './RunCommand.ts'

test('extension color picker opens with an initial color and edits the current document', async ({ page }) => {
  await page.goto('/extension-samples/color-picker/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const picker = page.locator('#preview-ide .ColorPicker')
  await expect(picker).toBeVisible()
  await expect(picker.locator('.ColorPickerBackgroundColor')).toHaveCSS('background-color', 'rgb(255, 136, 0)')
  const slider = picker.locator('.ColorPickerSliderWrapper')
  await expect(slider).toBeVisible()
  await slider.click({ position: { x: 200, y: 15 } })
  await expect(page.locator('#preview-ide .Editor')).not.toContainText('#112233')
  await expect(page.locator('#preview-ide .Editor')).toContainText('#')
  await page.keyboard.press('Escape')
  await expect(picker).toBeHidden()
  await runCommand(page, 'Sample: Open Color Picker')
  await expect(picker).toBeVisible()
})
