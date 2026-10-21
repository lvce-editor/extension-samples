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
| `daw`              | Delete the word under the cursor                                          |
| `caw`              | Delete the word under the cursor and enter insert mode                    |
| `u`                | Undo                                                                      |

Insert mode allows ordinary typing. Normal mode ignores unassigned text keys, Enter, Backspace, Delete, paste, cut and composition input. The command palette, arrow keys and other inputs keep their editor behavior. These commands reuse the editor's movement and undo semantics, including its boundary and word behavior. Counts, other operators, visual mode, registers, macros and Ex commands are outside this basic sample.

`daw` and `caw` use the editor's word selection: letters, digits and supported accented letters form a word. Punctuation, whitespace and empty lines contain no word to delete. `caw` enters insert mode even when there is no word to delete; Escape returns to normal mode. Deletion and replacement typing are separate undo steps. Escape cancels an incomplete sequence; an invalid printable ASCII key cancels it without editing text.

**Basic Vim: Stop** removes the keymap and restores the cursor preference. Restarting returns to normal mode. The keymap belongs to the preview application, so source editing and search inputs remain usable. Saving the source reloads the extension and starts a fresh keymap; disposing the preview removes its bindings and cursor override.

`registerEditorKeymap` installs declarative modes. Transitions happen synchronously before the next browser input event, while commands run in the owning application. Its asynchronous handle disposes the registration. The `cursorStyle` override lasts for that registration; the standard `getPreference` / `setPreference` API can also read and change `editor.cursorStyle` independently.
