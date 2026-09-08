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
    description: 'Show a warning dialog with a title, message, and dismiss button.',
    id: 'dialog',
    packageName: 'sample-dialog',
    preview: {
      entry: '/README.md',
      files: {
        '/README.md':
          '# Dialog\n\nFocus the preview editor, press F1, and run **Sample: Show Warning Dialog**. A warning dialog appears with a warning icon, title, message, and **OK** button. Dismiss it with **OK** or the close button, then run the command again.\n',
      },
    },
    route: 'dialog',
    title: 'Dialog',
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
    description: 'Jump from a variable reference to its declaration.',
    id: 'definition-provider',
    packageName: 'sample-definition-provider',
    preview: {
      entry: '/example.sample',
      files: {
        '/example.sample': 'let color = blue\n\nprint(color)\nprint(missing)\n',
      },
    },
    route: 'definition-provider',
    title: 'Definition Provider',
  },
  {
    description: 'Rename every matching identifier in a document.',
    id: 'rename-provider',
    packageName: 'sample-rename-provider',
    preview: {
      entry: '/example.sample',
      files: {
        '/example.sample': 'let color = blue\nlet colorful = green\nprint(color)\nprint(color)\n',
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
      entry: '/example.sample',
      files: {
        '/example.sample': 'import zebra\nimport apple\nimport zebra\n\nprint(apple)\n',
      },
    },
    route: 'code-actions',
    title: 'Code Actions',
  },
]
