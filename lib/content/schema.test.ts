import { describe, expect, it } from 'vitest'
import { Profile } from './schema'

const base = {
  name: 'Test Person',
  tagline: 'Builder',
  location: 'Somewhere',
  email: 'a@b.com',
  links: [{ label: 'LinkedIn', url: 'https://example.com/in/test' }],
  bio: 'bio',
}

describe('Profile schema', () => {
  it('accepts an optional currentCompany', () => {
    const parsed = Profile.parse({ ...base, currentCompany: 'Acme Corp' })
    expect(parsed.currentCompany).toBe('Acme Corp')
  })

  it('is valid without currentCompany', () => {
    const parsed = Profile.parse(base)
    expect(parsed.currentCompany).toBeUndefined()
  })
})
