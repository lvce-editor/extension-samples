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
]
