import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { loadProfile, loadResume } from '../lib/content/load'

const ROOT = process.cwd()

const targets: Array<{ path: string; data: unknown }> = [
  { path: join(ROOT, 'app/profile/data.json'), data: loadProfile() },
  { path: join(ROOT, 'app/resume/data.json'), data: loadResume() },
]

for (const { path, data } of targets) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
  console.log(`wrote ${path}`)
}
