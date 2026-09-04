import type { Sample } from './samples.ts'

const escapeAttribute = (value: string): string => {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

export const createHtml = (sample: Sample, nested: boolean): string => {
  const prefix = nested ? '..' : '.'
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeAttribute(sample.description)}">
    <title>${escapeAttribute(sample.title)} · Lvce Editor Extension Samples</title>
    <link rel="stylesheet" href="${prefix}/assets/app.css">
  </head>
  <body data-sample-id="${escapeAttribute(sample.id)}" data-route-prefix="${prefix}">
    <main class="Playground" aria-label="LVCE Editor extension playground">
      <header class="Toolbar">
        <a class="Brand" href="${prefix}/" aria-label="Extension samples home">LV</a>
        <label class="SamplePickerLabel" for="sample-picker">Sample</label>
        <select id="sample-picker" class="SamplePicker" aria-label="Extension sample"></select>
        <span class="SaveHint">Edit on the left · Ctrl+S rebuilds the extension and refreshes the preview</span>
        <span class="ToolbarSpacer"></span>
        <button id="reset-button" class="ResetButton" type="button">Reset sample</button>
      </header>
      <iframe
        id="workbench-frame"
        class="WorkbenchFrame"
        title="LVCE Editor workbench"
        src="${prefix}/workbench/${escapeAttribute(sample.id)}/?sample=${escapeAttribute(sample.id)}"
        allow="clipboard-read; clipboard-write"
      ></iframe>
    </main>
    <script type="module" src="${prefix}/assets/site.js"></script>
  </body>
</html>
`
}
