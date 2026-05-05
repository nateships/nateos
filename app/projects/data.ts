import type { Project } from '@/lib/content/schema'
import data from './data.json'

export type ProjectWithBody = Project & { body: string }

// Regenerated from `content/projects/*.mdx` via predev/prebuild/pretypecheck.
export const projectsData = data as ProjectWithBody[]
