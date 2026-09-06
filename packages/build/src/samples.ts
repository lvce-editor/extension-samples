export interface Sample {
  readonly description: string
  readonly id: string
  readonly packageName: string
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
]
