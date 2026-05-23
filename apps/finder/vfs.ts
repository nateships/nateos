import { isJobSearchActive } from '@/lib/job-search'

export type VfsEntry = {
  name: string
  kind: 'folder' | 'file'
  path: string
  /** For files: target path on the real site (e.g. /resume) or external URL. */
  open?: string
  size?: number
}

export const VFS: Record<string, VfsEntry[]> = {
  '/': [
    {
      name: 'Nate_OFarrell_Resume_2026.pdf',
      kind: 'file',
      path: '/Nate_OFarrell_Resume_2026.pdf',
      open: '/Nate_OFarrell_Resume_2026.pdf',
    },
    {
      name: 'Nate_OFarrell_Resume_2026.docx',
      kind: 'file',
      path: '/Nate_OFarrell_Resume_2026.docx',
      open: '/Nate_OFarrell_Resume_2026.docx',
    },
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

const RESUME_FILES = new Set(['/Nate_OFarrell_Resume_2026.pdf', '/Nate_OFarrell_Resume_2026.docx'])

export function listDir(path: string): VfsEntry[] {
  const entries = VFS[path] ?? []
  if (isJobSearchActive()) return entries
  return entries.filter((e) => !RESUME_FILES.has(e.path))
}
