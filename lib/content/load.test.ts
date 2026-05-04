import { describe, expect, it } from 'vitest'
import { loadProfile, loadProjects, loadResume } from './load'

describe('content loaders', () => {
  it('loadProfile returns a parsed Profile', () => {
    const p = loadProfile()
    expect(p.name).toBeDefined()
    expect(p.email).toMatch(/@/)
  })
  it('loadResume returns a parsed Resume', () => {
    const r = loadResume()
    expect(r.summary).toBeDefined()
    expect(Array.isArray(r.experience)).toBe(true)
  })
  it('loadProjects returns a sorted array of Project', () => {
    const ps = loadProjects()
    expect(Array.isArray(ps)).toBe(true)
    if (ps.length > 1) {
      for (let i = 1; i < ps.length; i++) {
        expect(ps[i].order).toBeGreaterThanOrEqual(ps[i - 1].order)
      }
    }
  })
})
