# Playground startup investigation

Measured on 2026-10-01 against `d767d48a3541`, using the completion-provider sample, Chromium 151.0.7922.34, a 1600×900 viewport, and the local static server. Each result is the median of three fresh browser launches. Each launch also performed one reload. The server sends `Cache-Control: no-store`, so the reload is a warm browser process, **not** a warm HTTP cache. These numbers are diagnostic comparisons, not CI timing thresholds.

| Independent build                 | Source rows visible | Preview rows visible | Playground ready | Browser tree PSS | Page-reported JS heap |
| --------------------------------- | ------------------: | -------------------: | ---------------: | ---------------: | --------------------: |
| Baseline, fresh browser           |             1946 ms |              2487 ms |          2701 ms |        656.9 MiB |              85.0 MiB |
| Concurrent startup data           |             1817 ms |              2373 ms |          2587 ms |        657.3 MiB |              85.0 MiB |
| Minified tooling (separate draft) |             1516 ms |              2072 ms |          2270 ms |        418.6 MiB |              28.4 MiB |
| Baseline, reload                  |             1865 ms |              2407 ms |          2622 ms |        788.1 MiB |             140.0 MiB |
| Concurrent startup data, reload   |             1820 ms |              2362 ms |          2560 ms |        788.4 MiB |             140.0 MiB |
| Minified tooling, reload          |             1443 ms |              1992 ms |          2224 ms |        478.5 MiB |              42.1 MiB |

PSS sums `/proc/PID/smaps_rollup` for the isolated browser and descendants immediately after readiness. It includes the browser, renderer, GPU and utility processes; it is not a tab-only measurement. `performance.memory.usedJSHeapSize` uses `--enable-precise-memory-info` and does not inventory every worker heap. Neither metric is post-GC retained memory. Increased reload memory alone does not establish a leak. Startup markers use a MutationObserver for the first `.EditorRow` in each pane and `data-playground-ready`.

The baseline and minified build have identical lockfiles and runtime manifests (`c5e72ea`). Both create 18 workers. The page's resource timing entries total 33,668,035 baseline response-body bytes versus 17,632,368 with minified tooling; this excludes requests initiated inside workers and is not compressed production network traffic. `tooling.json` accounts for 29,079,425 versus 13,043,758 bytes. Disk allocation reported by `du` is smaller on this filesystem and must not be used as payload size.

## Concurrent data experiment

The sample index, files, ESLint ignore hashes and tooling are independent, but were fetched sequentially. This draft starts them together and retains the existing source-before-preview application creation order. Under a controlled additional 100 ms delay on **each of those four responses**, median cold readiness changed from 3116 to 2774 ms; reload readiness changed from 3240 to 2739 ms. The no-delay timing difference is smaller and subject to machine noise. A response-gated e2e test verifies overlap directly, without a timing assertion. Failed requests still propagate through the existing startup error handler.

This does not eliminate the approximately 540 ms gap between the source and preview rows. Creating both applications concurrently needs separate validation of layout ownership, focus, extension setup and source generated-file commands.

## Tooling size experiment

The separate `feature/sample-tooling-size` draft minifies the three build-time CommonJS bundles while retaining function/class names. TypeScript ESLint is the largest input (17.2 MB of source before minification), followed by Unicorn (7.5 MB) and ESLint (3.2 MB). These are file contents inserted into the source workspace, even when lint evaluation is deferred. Reducing those strings saves download, JSON parsing and workspace copying costs without changing worker count. The roughly 500 MB report is plausible given this browser-tree measurement, but cannot be equated to a measured tab heap or attributed solely to workers.

That draft retains lazy-ESLint coverage for first edits, undo and restored drafts, and adds a 14 MB tooling payload budget. More structural reductions could split tooling into lazily fetched files, but must preserve both `memfs` access and the `sample-source` filesystem facade used by language tools.

## Build-time rendering and CSS

The build already emits the page shell and static links for `App.css` and playground CSS. The renderer owns application/view IDs, event listeners, editor models, viewport measurements and generated CSS. The `application.useOnLoadJson` setting executes extension commands from `onLoadCommands.json`; it is not a virtual-DOM hydration protocol. Serializing visible DOM alone would produce an inert snapshot and potentially duplicate live roots on startup, especially for saved drafts and different viewport sizes.

The deployed completion page had 11 adopted stylesheets with about 13 KB of CSS rule text. In the runtime, `addCssStyleSheet` tracks sheets by ID; `patchCssStyleSheet` and removal operate on that registry. Theme updates also dispatch `color-theme-changed`. Static links without registry reconciliation would leave duplicate/stale rules and break patching. A useful next experiment is a runtime-owned initial-view snapshot plus stylesheet registry seeding, keyed by runtime version, theme and sample, with explicit saved-draft and resize fallback. This investigation does not claim that either mechanism is implemented.

## Worker consolidation and precomputed themes

Observed workers include renderer, editor, syntax highlighting, extension management, icons, filesystem, source control, main area, explorer, source-files extension, activity/status/title bars, problems, text measurement, ESLint, completion and the sample extension. The count is 18 total, not two complete independent editor runtimes; application state is already keyed by application ID inside shared runtime workers. The compiler and ESLint evaluation worker remain lazy.

The icon worker has a module-level theme and command map, and its entry point immediately connects RPC to the worker global. Concatenating worker entries into one context would attach competing dispatchers to that same global. Existing `IconTheme.handleMessagePort` shows a possible transport seam, but consolidation needs explicit worker factories, per-module ports, lifecycle ownership, and tests for cancellation/disposal and extension isolation. It should not be implemented by rewriting published bundles during the sample build.

Color-theme data already ships in `config/colorTheme.json`. Precomputed file icons could avoid some initial icon requests, but explorer currently requests them through runtime RPC. A versioned initial icon table requires runtime lookup/fallback for new files, folders, language changes and theme changes; emitting unused JSON in extension-samples would not avoid worker startup. Keep each extension isolated when experimenting with internal worker consolidation.

## Validation and reproduction

The drafts preserve the full quality matrix (Ubuntu, macOS, Windows) and Chromium e2e workflow, including lazy compiler, lazy ESLint, preview setup, resizing and language-provider tests. The independent source changes do not alter application/extension ownership or the runtime stylesheet/theme code. CI must pass before these experiments are promoted beyond draft status.

The assigned task's attempt directory retains the measurement harness and raw six-observation files for baseline, concurrent data, minified tooling, and delayed-response comparisons. Do not interpret these results as a production-cache benchmark or a proof that worker consolidation, hydration, or theme precomputation has been completed.
