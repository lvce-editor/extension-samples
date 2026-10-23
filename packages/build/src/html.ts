import type { Sample } from './samples.ts'

const escapeAttribute = (value: string): string => {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

export const createHtml = (
  sample: Sample,
  nested: boolean,
  assetDir = '/extension-samples/runtime/test',
  runtimeConfig?: Record<string, unknown>,
): string => {
  const prefix = nested ? '..' : '.'
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeAttribute(sample.description)}">
    <title>${escapeAttribute(sample.title)} · Lvce Editor Extension Samples</title>
    <link rel="icon" href="${prefix}/runtime/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="${assetDir}/css/App.css">
    <link rel="stylesheet" href="${prefix}/assets/app.css">
  </head>
  <body data-sample-id="${escapeAttribute(sample.id)}" data-route-prefix="${prefix}">
    <main class="Playground" aria-label="LVCE Editor extension playground">
      <div class="IdePair">
        <section class="IdePane" aria-label="Source IDE"><div id="source-ide" class="IdeRoot"></div></section>
        <div id="preview-divider" class="PreviewDivider" role="separator" aria-label="Resize source and preview" aria-orientation="vertical" aria-controls="source-ide preview-ide" aria-valuemin="20" aria-valuemax="80" aria-valuenow="50" tabindex="0"></div>
        <section class="IdePane" aria-label="Preview IDE"><div id="preview-ide" class="IdeRoot"></div></section>
      </div>
      <div id="preview-status" class="VisuallyHidden" aria-live="polite">Loading…</div>
    </main>
    ${runtimeConfig ? `<script id="Config" type="application/json">${JSON.stringify(runtimeConfig).replaceAll('<', '\\u003c')}</script>` : ''}
    <script type="module" src="${prefix}/assets/site.js"></script>
  </body>
</html>
`
}
