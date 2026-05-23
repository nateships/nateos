import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MessagesApp } from './app'

const original = process.env.NEXT_PUBLIC_JOBSEARCH

afterEach(() => {
  cleanup()
  process.env.NEXT_PUBLIC_JOBSEARCH = original
})

describe('MessagesApp context options', () => {
  it('offers the recruiter option when job-searching', () => {
    process.env.NEXT_PUBLIC_JOBSEARCH = 'on'
    render(<MessagesApp />)
    expect(screen.getByRole('option', { name: /Recruiter/i })).toBeDefined()
  })

  it('hides the recruiter option when off', () => {
    process.env.NEXT_PUBLIC_JOBSEARCH = 'off'
    render(<MessagesApp />)
    expect(screen.queryByRole('option', { name: /Recruiter/i })).toBeNull()
    expect(screen.getByRole('option', { name: /Engineering peer/i })).toBeDefined()
  })
})
