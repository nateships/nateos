import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useViewport } from './use-viewport'

describe('useViewport', () => {
  let originalInnerWidth: number
  beforeEach(() => {
    originalInnerWidth = window.innerWidth
  })
  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true })
  })

  it('returns isMobile=true when innerWidth < 768', () => {
    Object.defineProperty(window, 'innerWidth', { value: 480, configurable: true })
    const { result } = renderHook(() => useViewport())
    expect(result.current.isMobile).toBe(true)
  })

  it('returns isMobile=false when innerWidth >= 768', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true })
    const { result } = renderHook(() => useViewport())
    expect(result.current.isMobile).toBe(false)
  })
})
