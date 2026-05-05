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

  it('cat resume.mdx fetches /api/content and returns text', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => '---\nsummary: hello\n---\nbody',
    } as unknown as Response)
    const out = await runCommand('cat resume.mdx', ctx)
    expect(out).toMatch(/summary/)
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/api/content'))
    fetchSpy.mockRestore()
  })

  it('cat without arg returns usage', async () => {
    const out = await runCommand('cat', ctx)
    expect(out).toBe('usage: cat <file>')
  })

  it('theme classic sets era to classic in settings store', async () => {
    const { useSettings } = await import('@/lib/settings/store')
    await runCommand('theme classic', ctx)
    expect(useSettings.getState().era).toBe('classic')
    await runCommand('theme tahoe', ctx)
    expect(useSettings.getState().era).toBe('tahoe')
  })

  it('theme without valid arg returns usage', async () => {
    const out = await runCommand('theme', ctx)
    expect(out).toMatch(/usage/)
  })

  it('sudo hire-me opens Messages and confirms permission granted', async () => {
    const out = await runCommand('sudo hire-me', ctx)
    expect(ctx.openApp).toHaveBeenCalledWith('messages')
    expect(out).toMatch(/permission granted/i)
  })

  it('sudo without hire-me returns helpful error', async () => {
    const out = await runCommand('sudo rm -rf', ctx)
    expect(out).toMatch(/sudo not supported/)
  })
})
