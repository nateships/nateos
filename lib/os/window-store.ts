import { v4 as uuid } from 'uuid'
import { create } from 'zustand'
import { byId } from './registry'
import type { AppParams, WindowState } from './types'

type State = {
  windows: WindowState[]
  zCounter: number
  focusedId: string | null
}

type Actions = {
  openApp(appId: string, params?: AppParams): string
  closeWindow(windowId: string): void
  focusWindow(windowId: string): void
  moveWindow(windowId: string, pos: { x: number; y: number }): void
  resizeWindow(windowId: string, size: { w: number; h: number }): void
  setWindowState(windowId: string, state: WindowState['state']): void
  reset(): void
}

const initial: State = { windows: [], zCounter: 0, focusedId: null }

export const useWindowStore = create<State & Actions>((set, get) => ({
  ...initial,

  openApp(appId, params) {
    const manifest = byId[appId]
    if (!manifest) throw new Error(`Unknown appId: ${appId}`)
    const supportsMulti = manifest.capabilities.includes('multi-instance')
    if (!supportsMulti) {
      const existing = get().windows.find((w) => w.appId === appId)
      if (existing) {
        get().focusWindow(existing.id)
        return existing.id
      }
    }
    const id = uuid()
    const z = get().zCounter + 1
    const offset = get().windows.length * 24
    const w: WindowState = {
      id,
      appId,
      position: { x: 120 + offset, y: 80 + offset },
      size: manifest.defaultSize,
      state: 'normal',
      z,
      params,
    }
    set((s) => ({ windows: [...s.windows, w], zCounter: z, focusedId: id }))
    return id
  },

  closeWindow(windowId) {
    set((s) => ({
      windows: s.windows.filter((w) => w.id !== windowId),
      focusedId: s.focusedId === windowId ? null : s.focusedId,
    }))
  },

  focusWindow(windowId) {
    set((s) => {
      const z = s.zCounter + 1
      return {
        windows: s.windows.map((w) => (w.id === windowId ? { ...w, z } : w)),
        zCounter: z,
        focusedId: windowId,
      }
    })
  },

  moveWindow(windowId, pos) {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === windowId ? { ...w, position: pos } : w)),
    }))
  },

  resizeWindow(windowId, size) {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === windowId ? { ...w, size } : w)),
    }))
  },

  setWindowState(windowId, state) {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === windowId ? { ...w, state } : w)),
    }))
  },

  reset() {
    set(initial)
  },
}))
