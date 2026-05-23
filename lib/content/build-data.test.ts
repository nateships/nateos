import { describe, expect, it } from 'vitest'
import { buildResumeData, EMPTY_RESUME } from './build-data'
import type { Resume } from './schema'

const full: Resume = {
  summary: 'Real summary',
  experience: [
    {
      company: 'Acme',
      title: 'Eng',
      start: '2020',
      end: '2024',
      location: 'Remote',
      bullets: ['did things'],
    },
  ],
  certifications: ['Cert A'],
  education: [{ school: 'Uni', program: 'CS', years: '2010-2014' }],
  skills: { Cloud: ['AWS'] },
}

describe('buildResumeData', () => {
  it('returns the full resume when active', () => {
    expect(buildResumeData(true, full)).toBe(full)
  })

  it('returns an empty resume when not active', () => {
    expect(buildResumeData(false, full)).toEqual(EMPTY_RESUME)
  })

  it('EMPTY_RESUME has no experience, certs, education, or skills', () => {
    expect(EMPTY_RESUME.summary).toBe('')
    expect(EMPTY_RESUME.experience).toEqual([])
    expect(EMPTY_RESUME.certifications).toEqual([])
    expect(EMPTY_RESUME.education).toEqual([])
    expect(EMPTY_RESUME.skills).toEqual({})
  })
})
