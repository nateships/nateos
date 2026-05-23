import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { buildResumeData } from '../lib/content/build-data'
import {
  loadLinks,
  loadProfile,
  loadProjectBody,
  loadProjects,
  loadResume,
} from '../lib/content/load'
import { isJobSearchActive } from '../lib/job-search'

const ROOT = process.cwd()

const projects = loadProjects().map((p) => ({
  ...p,
  body: loadProjectBody(p.slug),
}))

const targets: Array<{ path: string; data: unknown }> = [
  {
    path: join(ROOT, 'app/resume/data.json'),
    data: buildResumeData(isJobSearchActive(), loadResume()),
  },
  { path: join(ROOT, 'app/profile/data.json'), data: loadProfile() },
  { path: join(ROOT, 'app/projects/data.json'), data: projects },
  { path: join(ROOT, 'app/safari/data.json'), data: loadLinks() },
]

for (const { path, data } of targets) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
  console.log(`wrote ${path}`)
}
