import { describe, expect, it } from 'vitest'
import { type CalcState, calc, initialState } from './engine'

function run(seq: (number | string)[]): CalcState {
  let s = initialState()
  for (const k of seq) {
    s = calc(s, typeof k === 'number' ? { kind: 'digit', d: k } : { kind: 'op', op: k as never })
  }
  return s
}

describe('calculator engine', () => {
  it('1 + 2 = 3', () => {
    const s = run([1, '+', 2, '='])
    expect(s.display).toBe('3')
  })
  it('10 / 4 = 2.5', () => {
    const s = run([1, 0, '/', 4, '='])
    expect(s.display).toBe('2.5')
  })
  it('7 - 3 - 1 = 3', () => {
    const s = run([7, '-', 3, '-', 1, '='])
    expect(s.display).toBe('3')
  })
  it('AC clears', () => {
    let s = run([1, 2, 3])
    s = calc(s, { kind: 'op', op: 'AC' })
    expect(s.display).toBe('0')
  })
  it('±  toggles sign', () => {
    let s = run([5])
    s = calc(s, { kind: 'op', op: '±' })
    expect(s.display).toBe('-5')
  })
  it('% divides by 100', () => {
    let s = run([5, 0])
    s = calc(s, { kind: 'op', op: '%' })
    expect(s.display).toBe('0.5')
  })
})
