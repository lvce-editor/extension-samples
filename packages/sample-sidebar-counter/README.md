# Sidebar Counter

Contribute a sidebar view rendered with virtual DOM and update it with increment/decrement buttons.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/sidebar-counter/). The **Counter** sidebar opens automatically in the preview. Click **Increment** or **Decrement** to change the count, including negative values. The buttons also support standard keyboard activation.

Edit `src/main.ts` and save with Ctrl+S to rebuild the preview. For example, change `count += 1` to `count += 2`. A new view starts at zero. **Reset sample** restores the original source.

## API

The manifest contributes a view with `kind: "virtualDom"`, `preferredLocation: "sideBar"`, and a matching `onView` activation event. The isolated extension awaits `activate()` and calls `registerView()` with the same ID.

`create()` owns the count for each view instance. `render()` returns a flat, depth-first virtual DOM array; each node's `childCount` counts its direct children. Buttons have a `name` that arrives in `handleEvent()` with `type: 'click'`. LVCE renders the updated virtual DOM after the handler returns. `getCss()` styles the view, and the count uses a live status region.

`.lvce/setup-preview.js` opens the contributed sidebar in the playground. It is playground setup, not part of the extension API.
