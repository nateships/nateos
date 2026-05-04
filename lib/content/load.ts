import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { type Links, Profile, type Project, Project as ProjectSchema, Resume } from './schema'

const ROOT = join(process.cwd(), 'content')

function readFront<T>(file: string): T {
  const raw = readFileSync(join(ROOT, file), 'utf8')
  return matter(raw).data as T
}

export function loadProfile() {
  return Profile.parse(readFront('profile.mdx'))
}

export function loadResume() {
  return Resume.parse(readFront('resume.mdx'))
}

export function loadProjects(): Project[] {
  const dir = join(ROOT, 'projects')
  const files = readdirSync(dir).filter((f) => f.endsWith('.mdx') && !f.startsWith('_'))
  const items = files.map((f) => ProjectSchema.parse(readFront(`projects/${f}`)))
  return items.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

export function loadLinks(): Links['bookmarks'] {
  const raw = readFront('links.mdx') as { bookmarks?: Links['bookmarks'] }
  return raw.bookmarks ?? []
}
