import type { Sample } from './samples.ts'

const escapeAttribute = (value: string): string => {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

export const createHtml = (sample: Sample, nested: boolean): string => {
  const prefix = nested ? '..' : '.'
  const sourceUrl = `${prefix}/samples/${sample.id}/src/main.ts`
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeAttribute(sample.description)}">
    <title>${escapeAttribute(sample.title)} · Lvce Editor Extension Samples</title>
    <link rel="stylesheet" href="${prefix}/assets/app.css">
  </head>
  <body
    data-sample-id="${escapeAttribute(sample.id)}"
    data-source-url="${escapeAttribute(sourceUrl)}"
    data-wasm-url="${prefix}/assets/esbuild.wasm"
    data-route-prefix="${prefix}"
  >
    <main class="Workbench" aria-label="Lvce Editor extension playground">
      <aside class="CollapsedSideBar" aria-label="Collapsed sidebar">
        <a class="Brand" href="${prefix}/" aria-label="Extension samples home">LV</a>
        <button class="SideBarIcon SideBarIconActive" type="button" title="Explorer collapsed" aria-label="Explorer collapsed">▱</button>
        <button class="SideBarIcon" type="button" title="Extensions" aria-label="Extensions">◇</button>
      </aside>
      <section class="CodePane" aria-label="Extension source">
        <div class="Toolbar">
          <label class="SamplePickerLabel" for="sample-picker">Sample</label>
          <select id="sample-picker" class="SamplePicker" aria-label="Extension sample"></select>
          <span class="ToolbarSpacer"></span>
          <button id="reset-button" class="Button ButtonSecondary" type="button">Reset</button>
          <button id="save-button" class="Button ButtonPrimary" type="button">Save &amp; run</button>
        </div>
        <div class="EditorTab" aria-label="Open editor tab">
          <span class="TypeScriptIcon">TS</span>
          <span>main.ts</span>
          <span id="dirty-indicator" class="DirtyIndicator" aria-label="Unsaved changes"></span>
        </div>
        <div class="EditorSurface">
          <div id="line-numbers" class="LineNumbers" aria-hidden="true"></div>
          <textarea id="source-editor" class="SourceEditor" aria-label="TypeScript extension source" spellcheck="false"></textarea>
        </div>
        <div id="build-status" class="BuildStatus" role="status" aria-live="polite">Loading source…</div>
      </section>
      <section class="PreviewPane" aria-label="Live extension preview">
        <div class="PreviewHeader">
          <div>
            <div class="Eyebrow">Live preview</div>
            <h1>${escapeAttribute(sample.title)}</h1>
          </div>
          <span class="PreviewBadge">Sandboxed</span>
        </div>
        <p class="PreviewDescription">${escapeAttribute(sample.description)}</p>
        <iframe id="preview-frame" class="PreviewFrame" title="Extension preview" sandbox="allow-scripts"></iframe>
      </section>
    </main>
    <script type="module" src="${prefix}/assets/app.js"></script>
  </body>
</html>
`
}
