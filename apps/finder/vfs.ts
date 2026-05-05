export type VfsEntry = {
  name: string
  kind: 'folder' | 'file'
  path: string
  /** For files: target path on the real site (e.g. /resume) or external URL. */
  open?: string
  size?: number
}

export const VFS_ROOT: VfsEntry = {
  name: 'Nate',
  kind: 'folder',
  path: '/',
}

export const VFS: Record<string, VfsEntry[]> = {
  '/': [
    { name: 'Resume.pdf', kind: 'file', path: '/Resume.pdf', open: '/resume.pdf' },
    { name: 'Projects', kind: 'folder', path: '/Projects' },
    { name: 'Documents', kind: 'folder', path: '/Documents' },
    { name: 'Links.txt', kind: 'file', path: '/Links.txt', open: '/safari' },
    { name: 'Calendar', kind: 'folder', path: '/Calendar' },
  ],
  '/Projects': [
    { name: 'IDEA.md', kind: 'file', path: '/Projects/IDEA.md', open: '/projects/idea' },
    {
      name: 'Sleepbar.md',
      kind: 'file',
      path: '/Projects/Sleepbar.md',
      open: '/projects/sleepbar',
    },
    {
      name: 're:Invent 2022.md',
      kind: 'file',
      path: '/Projects/re:Invent 2022.md',
      open: '/projects/reinvent-2022',
    },
  ],
  '/Documents': [
    { name: 'Resume.md', kind: 'file', path: '/Documents/Resume.md', open: '/resume' },
  ],
  '/Calendar': [
    { name: 'Book intro chat ↗', kind: 'file', path: '/Calendar/Book.url', open: '/calendar' },
  ],
}

export function listDir(path: string): VfsEntry[] {
  return VFS[path] ?? []
}
