import { describe, expect, it, vi } from 'vitest'
import { runCommand } from './commands'

const ctx = {
  openApp: vi.fn(),
  closeWindow: vi.fn(),
}

describe('terminal commands', () => {
  it('help lists available commands', async () => {
    const out = await runCommand('help', ctx)
    expect(out).toMatch(/help/)
    expect(out).toMatch(/open/)
    expect(out).toMatch(/apps/)
  })

  it('apps lists known apps', async () => {
    const out = await runCommand('apps', ctx)
    expect(out).toMatch(/resume/)
    expect(out).toMatch(/terminal/)
  })

  it('open <app> calls openApp', async () => {
    await runCommand('open resume', ctx)
    expect(ctx.openApp).toHaveBeenCalledWith('resume', undefined)
  })

  it('whoami returns identity', async () => {
    const out = await runCommand('whoami', ctx)
    expect(out).toMatch(/nate/i)
  })

  it('clear returns __CLEAR__ sentinel', async () => {
    const out = await runCommand('clear', ctx)
    expect(out).toBe('__CLEAR__')
  })

  it('unknown command returns helpful error', async () => {
    const out = await runCommand('whatever', ctx)
    expect(out).toMatch(/command not found/)
  })
})
