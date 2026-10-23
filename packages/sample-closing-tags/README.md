# Closing Tags

Complete a closing tag from the most recent open tag.

## Try it

Open [the playground](https://lvce-editor.github.io/extension-samples/closing-tags/). The preview starts with `<demo><`. Focus the editor and run **Sample: Complete Closing Tag** from F1. The extension completes it as `<demo></demo>`.

Edit `src/main.ts` or `extension.json` in the source editor and save with Ctrl+S to rebuild the preview. **Reset sample** restores the original source.

## API

This isolated extension awaits `activate()` before registering its provider and command. The command calls the editor's built-in action so the edit uses normal editor behavior and undo history.
