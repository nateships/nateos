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

  it('shows the LinkedIn card and no Experience/download when off', () => {
    process.env.NEXT_PUBLIC_JOBSEARCH = 'off'
    render(<ResumeApp />)
    expect(screen.getByRole('link', { name: /Connect on LinkedIn/i })).toBeDefined()
    expect(screen.queryByRole('heading', { name: 'Experience' })).toBeNull()
    expect(screen.queryByText('Preview PDF')).toBeNull()
  })
})
