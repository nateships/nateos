import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DesktopWidgets } from './DesktopWidgets'

const original = process.env.NEXT_PUBLIC_JOBSEARCH

afterEach(() => {
  cleanup()
  process.env.NEXT_PUBLIC_JOBSEARCH = original
})

describe('DesktopWidgets', () => {
  it('renders the Save my contact vCard when job-searching', () => {
    process.env.NEXT_PUBLIC_JOBSEARCH = 'on'
    render(<DesktopWidgets />)
    expect(screen.getByText('Save my contact')).toBeDefined()
  })

  it('hides the vCard when off', () => {
    process.env.NEXT_PUBLIC_JOBSEARCH = 'off'
    render(<DesktopWidgets />)
    expect(screen.queryByText('Save my contact')).toBeNull()
  })
})
