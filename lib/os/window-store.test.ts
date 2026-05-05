import { beforeEach, describe, expect, it } from 'vitest'
import { useWindowStore } from './window-store'

describe('window-store', () => {
  beforeEach(() => {
    useWindowStore.getState().reset()
  })

  it('opens an app and returns a window id', () => {
    const id = useWindowStore.getState().openApp('terminal')
    const w = useWindowStore.getState().windows.find((x) => x.id === id)
    expect(w).toBeDefined()
    expect(w?.appId).toBe('terminal')
    expect(w?.state).toBe('normal')
  })

  it('focusing a window bumps its z above all others', () => {
    const a = useWindowStore.getState().openApp('terminal')
    const b = useWindowStore.getState().openApp('resume')
    useWindowStore.getState().focusWindow(a)
    const wins = useWindowStore.getState().windows
    const ax = wins.find((w) => w.id === a)!
    const bx = wins.find((w) => w.id === b)!
    expect(ax.z).toBeGreaterThan(bx.z)
  })

  it('closing a window removes it', () => {
    const id = useWindowStore.getState().openApp('terminal')
    useWindowStore.getState().closeWindow(id)
    expect(useWindowStore.getState().windows).toHaveLength(0)
  })

  it('multi-instance: opening terminal twice yields two windows', () => {
    useWindowStore.getState().openApp('terminal', { instance: 1 })
    useWindowStore.getState().openApp('terminal', { instance: 2 })
    const wins = useWindowStore.getState().windows.filter((w) => w.appId === 'terminal')
    expect(wins).toHaveLength(2)
  })
})
