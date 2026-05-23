import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DesktopIcons } from './DesktopIcons'

const original = process.env.NEXT_PUBLIC_JOBSEARCH
afterEach(() => {
  cleanup()
  process.env.NEXT_PUBLIC_JOBSEARCH = original
})

describe('DesktopIcons', () => {
  it('shows the resume PDF/DOCX icons when job-searching', () => {
    process.env.NEXT_PUBLIC_JOBSEARCH = 'on'
    render(<DesktopIcons />)
    expect(screen.getByText((c) => c.includes('Resume_2026.pdf'))).toBeDefined()
    expect(screen.getByText((c) => c.includes('Resume_2026.docx'))).toBeDefined()
    expect(screen.getByText('Projects')).toBeDefined()
  })
  it('hides the resume icons but keeps Projects when off', () => {
    process.env.NEXT_PUBLIC_JOBSEARCH = 'off'
    render(<DesktopIcons />)
    expect(screen.queryByText((c) => c.includes('Resume_2026.pdf'))).toBeNull()
    expect(screen.queryByText((c) => c.includes('Resume_2026.docx'))).toBeNull()
    expect(screen.getByText('Projects')).toBeDefined()
  })
})
