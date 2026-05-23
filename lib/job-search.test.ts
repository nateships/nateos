import { describe, expect, it } from 'vitest'
import { isJobSearchActive } from './job-search'

describe('isJobSearchActive', () => {
  it('is false only when the value is exactly "off"', () => {
    expect(isJobSearchActive('off')).toBe(false)
  })

  it('is true when the value is "on"', () => {
    expect(isJobSearchActive('on')).toBe(true)
  })

  it('is true when the value is unset', () => {
    expect(isJobSearchActive(undefined)).toBe(true)
  })

  it('fails open: any unexpected value is treated as active', () => {
    expect(isJobSearchActive('OFF')).toBe(true)
    expect(isJobSearchActive('false')).toBe(true)
    expect(isJobSearchActive('')).toBe(true)
  })
})
