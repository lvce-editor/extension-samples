# Basic Vim

The playground starts in normal mode with a block cursor. When installing the sample as an extension, run **Basic Vim: Start** from the command palette.

| Key                | Action                                                                    |
| ------------------ | ------------------------------------------------------------------------- |
| `h`, `j`, `k`, `l` | Move left, down, up, right                                                |
| `w`, `b`           | Move one word right or left                                               |
| `0`, `$`           | Move to the line start or end                                             |
| `i`                | Enter insert mode at the cursor                                           |
| `a`, `A`, `I`      | Enter insert mode after the cursor, at the line end, or at the line start |
| `Escape`           | Return from insert mode to normal mode                                    |
| `x`                | Delete the character to the right                                         |
| `u`                | Undo                                                                      |

Insert mode allows ordinary typing. Normal mode ignores unassigned text keys, Enter, Backspace, Delete and paste. Modified shortcuts (including the command palette), arrow keys and other inputs keep their editor behavior. These commands reuse the editor's movement and undo semantics, including its boundary and word behavior. Counts, operators, visual mode, registers, macros and Ex commands are outside this basic sample.

**Basic Vim: Stop** removes the keymap and restores the cursor preference. Restarting returns to normal mode. The keymap belongs to the preview application, so source editing and search inputs remain usable. Saving the source reloads the extension and starts a fresh keymap; disposing the preview removes its bindings and cursor override.

`registerEditorKeymap` installs declarative modes. Transitions happen synchronously before the next browser input event, while commands run in the owning application. Its asynchronous handle disposes the registration. The `cursorStyle` override lasts for that registration; the standard `getPreference` / `setPreference` API can also read and change `editor.cursorStyle` independently.
