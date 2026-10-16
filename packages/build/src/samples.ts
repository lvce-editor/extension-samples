export interface Sample {
  readonly description: string
  readonly id: string
  readonly packageName: string
  readonly preview?: {
    readonly entry: string
    readonly files: Record<string, string>
  }
  readonly route: string
  readonly title: string
}

export const samples: readonly Sample[] = [
  {
    description: 'Replace matching files with a custom virtual DOM greeting view.',
    id: 'file-view',
    packageName: 'sample-file-view',
    preview: {
      entry: '/welcome.hello',
      files: {
        '/notes.txt': 'This file stays in the text editor.\n',
        '/welcome.hello': 'Welcome to custom file views!\n',
      },
    },
    route: 'file-view',
    title: 'File View',
  },
  {
    description: 'Render an interactive, per-file counter for files with the .count extension.',
    id: 'file-view-counter',
    packageName: 'sample-file-view-counter',
    preview: {
      entry: '/first.count',
      files: {
        '/first.count': 'First counter\n',
        '/notes.txt': 'This file stays in the text editor.\n',
        '/second.count': 'Second counter\n',
      },
    },
    route: 'file-view-counter',
    title: 'File View Counter',
  },
  {
    description: 'Build a writable in-memory workspace with files and folders.',
    id: 'file-system-provider',
    packageName: 'sample-file-system-provider',
    route: 'file-system-provider',
    title: 'File System Provider',
  },
  {
    description: 'Expose mock changed files, SVG decorations, and example commit actions.',
    id: 'source-control-provider',
    packageName: 'sample-source-control-provider',
    route: 'source-control-provider',
    title: 'Source Control Provider',
  },
  {
    description: 'Underline TODO markers and clear diagnostics when they are resolved.',
    id: 'diagnostic-provider',
    packageName: 'sample-diagnostic-provider',
    preview: { entry: '/example.txt', files: { '/example.txt': 'color=TODO\nsize=TODO\n' } },
    route: 'diagnostic-provider',
    title: 'Diagnostic Provider',
  },
  {
    description: 'Suggest colors and insert the selected completion.',
    id: 'completion-provider',
    packageName: 'sample-completion-provider',
    preview: { entry: '/example.txt', files: { '/example.txt': 'color=\n' } },
    route: 'completion-provider',
    title: 'Completion Provider',
  },
  {
    description: 'Show documentation for recognized color names.',
    id: 'hover-provider',
    packageName: 'sample-hover-provider',
    preview: { entry: '/example.txt', files: { '/example.txt': 'blue green red unknown\n' } },
    route: 'hover-provider',
    title: 'Hover Provider',
  },
  {
    description: 'Jump from a variable reference to its declaration.',
    id: 'definition-provider',
    packageName: 'sample-definition-provider',
    preview: { entry: '/example.txt', files: { '/example.txt': 'let color = blue\n\nprint(color)\nprint(missing)\n' } },
    route: 'definition-provider',
    title: 'Definition Provider',
  },
  {
    description: 'Jump from a variable reference to its annotated type declaration.',
    id: 'type-definition-provider',
    packageName: 'sample-type-definition-provider',
    preview: { entry: '/example.txt', files: { '/example.txt': 'type Color = string\nlet color: Color = blue\n\nprint(color)\nprint(missing)\n' } },
    route: 'type-definition-provider',
    title: 'Type Definition Provider',
  },
  {
    description: 'Choose custom items with labels, descriptions, icons, and distinct values.',
    id: 'quick-pick',
    packageName: 'sample-quick-pick',
    preview: {
      entry: '/README.md',
      files: {
        '/README.md':
          '# Quick Pick\n\nFocus the preview editor, press F1, and run **Sample: Choose Environment**. Filter or select an item. The extension writes its distinct value (for example, `staging`) to `environment.txt` and opens it. Escape cancels without writing a file.\n',
      },
    },
    route: 'quick-pick',
    title: 'Quick Pick',
  },
  {
    description: 'Open the editor color picker with an initial color and edit the document.',
    id: 'color-picker',
    packageName: 'sample-color-picker',
    preview: {
      entry: '/example.txt',
      files: { '/example.txt': '#112233\n' },
    },
    route: 'color-picker',
    title: 'Color Picker',
  },
  {
    description: 'Format key-value settings using document edits.',
    id: 'formatting-provider',
    packageName: 'sample-formatting-provider',
    preview: { entry: '/example.txt', files: { '/example.txt': '  color=blue  \nsize =large\n' } },
    route: 'formatting-provider',
    title: 'Formatting Provider',
  },
  {
    description: 'Prompt for a name and write a greeting, with cancellation handling.',
    id: 'quick-input',
    packageName: 'sample-quick-input',
    preview: {
      entry: '/README.md',
      files: {
        '/README.md':
          '# Quick Input\n\nFocus the preview editor, press F1, and run **Sample: Create Greeting**. Replace the initial value `World` with a name and press Enter. The extension writes and opens `greeting.txt`. Escape or an empty name leaves the workspace unchanged.\n',
      },
    },
    route: 'quick-input',
    title: 'Quick Input',
  },
  {
    description: 'Show a Hello World notification.',
    id: 'hello-world',
    packageName: 'sample-hello-world',
    preview: {
      entry: '/README.md',
      files: {
        '/README.md':
          '# Hello World\n\nFocus the preview editor, press F1, and run **Sample: Hello World**. A notification saying **Hello World!** appears in the preview.\n',
      },
    },
    route: 'hello-world',
    title: 'Hello World',
  },
  {
    description: 'Insert text at the cursor or replace the current selection.',
    id: 'text-manipulation',
    packageName: 'sample-text-manipulation',
    preview: {
      entry: '/example.txt',
      files: { '/example.txt': 'Hello, Lvce!\nKeep this line unchanged.\n' },
    },
    route: 'text-manipulation',
    title: 'Text Manipulation',
  },
  {
    description: 'Underline selections, flag TODO markers, color-code keywords, and spot repeated words.',
    id: 'text-decoration',
    packageName: 'sample-text-decoration',
    preview: {
      entry: '/example.txt',
      files: {
        '/example.txt': 'TODO: choose a bright color\nconst plan = "small samples"\nreturn the the finished preview.\n',
      },
    },
    route: 'text-decoration',
    title: 'Text Decoration',
  },
  {
    description: 'Count words in the active preview document.',
    id: 'word-count',
    packageName: 'sample-word-count',
    preview: {
      entry: '/README.md',
      files: {
        '/README.md': '# Word Count\n\nCount words in the active document. Edit this text and run **Sample: Count Words** again.\n',
      },
    },
    route: 'word-count',
    title: 'Word Count',
  },
  {
    description: 'Show a warning dialog with a title, message, and dismiss button.',
    id: 'dialog',
    packageName: 'sample-dialog',
    preview: {
      entry: '/README.md',
      files: {
        '/README.md':
          '# Dialog\n\nThe warning dialog appears automatically when the playground opens. Dismiss it with **OK** or the close button, then press F1 and run **Sample: Show Warning Dialog** to open it again.\n',
      },
    },
    route: 'dialog',
    title: 'Dialog',
  },
  {
    description: 'Show an information dialog with an info icon and dismiss button.',
    id: 'info-dialog',
    packageName: 'sample-info-dialog',
    preview: {
      entry: '/README.md',
      files: {
        '/README.md':
          '# Information Dialog\n\nThe information dialog appears automatically with an info icon, title, message, and **OK** button. Dismiss it with **OK** or the close button, then press F1 and run **Sample: Show Information Dialog** to open it again.\n',
      },
    },
    route: 'info-dialog',
    title: 'Information Dialog',
  },
  {
    description: 'Show an error dialog with an error icon and dismiss button.',
    id: 'error-dialog',
    packageName: 'sample-error-dialog',
    preview: {
      entry: '/README.md',
      files: {
        '/README.md':
          '# Error Dialog\n\nThe error dialog appears automatically with an error icon, title, message, and **OK** button. Dismiss it with **OK** or the close button, then press F1 and run **Sample: Show Error Dialog** to open it again.\n',
      },
    },
    route: 'error-dialog',
    title: 'Error Dialog',
  },
  {
    description: 'Render a sidebar with virtual DOM and increment/decrement a counter.',
    id: 'sidebar-counter',
    packageName: 'sample-sidebar-counter',
    preview: {
      entry: '/README.md',
      files: {
        '/README.md':
          '# Sidebar Counter\n\nUse **Increment** and **Decrement** in the Counter sidebar. Edit the source on the left and save with Ctrl+S to rebuild the preview.\n',
      },
    },
    route: 'sidebar-counter',
    title: 'Sidebar Counter',
  },
  {
    description: 'Choose an environment from a clickable status bar item.',
    id: 'status-bar-item',
    packageName: 'sample-status-bar-item',
    preview: {
      entry: '/README.md',
      files: {
        '/README.md':
          '# Status Bar Item\n\nClick **Environment: Development** in the preview status bar. Choose **Staging** or **Production** to update the label. Escape cancels without changing it. The command palette also offers **Sample: Select Environment**.\n',
      },
    },
    route: 'status-bar-item',
    title: 'Status Bar Item',
  },
  {
    description: 'Write, append, and clear simulated build logs in the Output panel.',
    id: 'output-channel',
    packageName: 'sample-output-channel',
    preview: {
      entry: '/README.md',
      files: {
        '/README.md':
          '# Output Channel\n\nThe Output panel opens with a welcome line. Focus the preview editor, press F1, and run **Sample: Run Build**. Each run appends a numbered simulated build. Run **Sample: Clear Build Output** to clear the log.\n',
      },
    },
    route: 'output-channel',
    title: 'Output Channel',
  },
  {
    description: 'Rename every matching identifier in a document.',
    id: 'rename-provider',
    packageName: 'sample-rename-provider',
    preview: {
      entry: '/example.txt',
      files: {
        '/example.txt': 'let color = blue\nlet colorful = green\nprint(color)\nprint(color)\n',
      },
    },
    route: 'rename-provider',
    title: 'Rename Provider',
  },
  {
    description: 'Organize a block of imports with a source code action.',
    id: 'code-actions',
    packageName: 'sample-code-actions',
    preview: {
      entry: '/example.txt',
      files: {
        '/example.txt': 'import zebra\nimport apple\n\nprint(apple)\n',
      },
    },
    route: 'code-actions',
    title: 'Code Actions',
  },
  {
    description: 'Parse unsaved HTML into a live virtual DOM preview and report malformed markup.',
    id: 'html-preview',
    packageName: 'sample-html-preview',
    preview: {
      entry: '/index.html',
      files: {
        '/index.html': '<main class="page"><h1>Hello, HTML</h1><p>Edit this document to update the preview.</p></main>\n',
      },
    },
    route: 'html-preview',
    title: 'Live HTML Preview',
  },
  {
    description: 'Read and update an editor preference with cancellation and reset.',
    id: 'preferences',
    packageName: 'sample-preferences',
    preview: {
      entry: '/README.md',
      files: {
        '/README.md':
          '# Preferences\n\nFocus the preview editor, press F1, and run **Sample: Set Font Size**. Escape cancels without changing `editor.fontSize`. Choose a size to update it, then run **Sample: Reset Font Size** to restore the value captured when the sample activated. The Output panel reports the value read through `getPreference`.\n',
      },
    },
    route: 'preferences',
    title: 'Preferences',
  },
  {
    description: 'Expose setting declarations as document symbols in editor breadcrumbs.',
    id: 'document-symbol-provider',
    packageName: 'sample-document-symbol-provider',
    preview: { entry: '/settings.txt', files: { '/settings.txt': 'color=blue\nsize=large\n' } },
    route: 'document-symbol-provider',
    title: 'Document Symbols',
  },
  {
    description: 'Create, list, and remove local authentication-provider sessions.',
    id: 'authentication-provider',
    packageName: 'sample-authentication-provider',
    preview: {
      entry: '/README.md',
      files: {
        '/README.md':
          '# Local Authentication\n\nRun Sample: Sign In Locally, Sample: List Local Sessions, or Sample: Sign Out Locally from F1. Escape cancels sign-in. Sessions are in-memory demonstration data.\n',
      },
    },
    route: 'authentication-provider',
    title: 'Authentication Provider',
  },
  {
    description: 'Decorate marker lines with gutter bars and end-of-line labels.',
    id: 'editor-decorations',
    packageName: 'sample-editor-decorations',
    preview: { entry: '/markers.txt', files: { '/markers.txt': '+ added item\n~ changed item\n- removed item\nordinary line\n' } },
    route: 'editor-decorations',
    title: 'Editor Decorations',
  },
  {
    description: 'Show signature and active-parameter documentation for a mix function.',
    id: 'signature-help',
    packageName: 'sample-signature-help',
    preview: { entry: '/colors.txt', files: { '/colors.txt': 'mix(blue, green)\n' } },
    route: 'signature-help',
    title: 'Signature Help',
  },
  {
    description: 'Provide paired braces, closing tags, comments, selections, and log snippets.',
    id: 'language-editing',
    packageName: 'sample-language-editing',
    preview: { entry: '/example.txt', files: { '/example.txt': 'word\n<demo><\nlog\n' } },
    route: 'language-editing',
    title: 'Language Editing',
  },
]
