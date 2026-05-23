import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ResumeApp } from './app'

const original = process.env.NEXT_PUBLIC_JOBSEARCH

afterEach(() => {
  cleanup()
  process.env.NEXT_PUBLIC_JOBSEARCH = original
})

describe('ResumeApp', () => {
  it('shows the full CV (Experience section) when job-searching', () => {
    process.env.NEXT_PUBLIC_JOBSEARCH = 'on'
    render(<ResumeApp />)
    expect(screen.getByRole('heading', { name: 'Experience' })).toBeDefined()
  })

  it('shows the profile card (avatar + social links, no CV) when off', () => {
    process.env.NEXT_PUBLIC_JOBSEARCH = 'off'
    render(<ResumeApp />)
    // Initials avatar for "Nate O'Farrell".
    expect(screen.getByText('NO')).toBeDefined()
    // Social links resolve to the right destinations.
    expect(screen.getByRole('link', { name: 'LinkedIn' }).getAttribute('href')).toContain(
      'linkedin.com',
    )
    expect(screen.getByRole('link', { name: 'GitHub' }).getAttribute('href')).toContain(
      'github.com',
    )
    expect(screen.getByRole('link', { name: 'Email' }).getAttribute('href')).toMatch(/^mailto:/)
    // No CV content or downloads.
    expect(screen.queryByRole('heading', { name: 'Experience' })).toBeNull()
    expect(screen.queryByText('Preview PDF')).toBeNull()
  })
})
