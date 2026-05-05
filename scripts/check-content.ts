import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { Profile, Resume } from '../lib/content/schema'

const ROOT = join(process.cwd(), 'content')

function load(file: string) {
  const raw = readFileSync(join(ROOT, file), 'utf8')
  return matter(raw).data
}

let failed = 0

if (existsSync(join(ROOT, 'profile.mdx'))) {
  const r = Profile.safeParse(load('profile.mdx'))
  if (!r.success) {
    console.error('profile.mdx invalid:', r.error.format())
    failed++
  }
}

if (existsSync(join(ROOT, 'resume.mdx'))) {
  const r = Resume.safeParse(load('resume.mdx'))
  if (!r.success) {
    console.error('resume.mdx invalid:', r.error.format())
    failed++
  }
}

console.log(failed === 0 ? '✓ content valid' : `✗ ${failed} content file(s) invalid`)
process.exit(failed === 0 ? 0 : 1)
