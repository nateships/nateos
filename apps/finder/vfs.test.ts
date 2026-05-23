import { afterEach, describe, expect, it } from 'vitest'
import { listDir } from './vfs'

const original = process.env.NEXT_PUBLIC_JOBSEARCH
afterEach(() => {
  process.env.NEXT_PUBLIC_JOBSEARCH = original
})

describe('listDir resume gating', () => {
  it('includes resume PDF/DOCX in root when job-searching', () => {
    process.env.NEXT_PUBLIC_JOBSEARCH = 'on'
    const names = listDir('/').map((e) => e.name)
    expect(names).toContain('Nate_OFarrell_Resume_2026.pdf')
    expect(names).toContain('Nate_OFarrell_Resume_2026.docx')
  })
  it('excludes resume PDF/DOCX from root when off, keeps other entries', () => {
    process.env.NEXT_PUBLIC_JOBSEARCH = 'off'
    const names = listDir('/').map((e) => e.name)
    expect(names).not.toContain('Nate_OFarrell_Resume_2026.pdf')
    expect(names).not.toContain('Nate_OFarrell_Resume_2026.docx')
    expect(names).toContain('Projects')
  })
})
