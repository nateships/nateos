import { describe, expect, it } from 'vitest'
import { isJobSearchActive } from './job-search'

describe('isJobSearchActive', () => {
  it('is true only when the value is exactly "on"', () => {
    expect(isJobSearchActive('on')).toBe(true)
  })

  it('is false when the value is "off"', () => {
    expect(isJobSearchActive('off')).toBe(false)
  })

  it('is false when the value is unset', () => {
    expect(isJobSearchActive(undefined)).toBe(false)
  })

  it('fails closed: any unexpected value is treated as inactive', () => {
    expect(isJobSearchActive('ON')).toBe(false)
    expect(isJobSearchActive('true')).toBe(false)
    expect(isJobSearchActive('')).toBe(false)
  })
})
