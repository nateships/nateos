import { v4 as uuid } from 'uuid'
import { create } from 'zustand'
import { MENUBAR_H } from './layout'
import { byId } from './registry'
import type { AppParams, WindowState } from './types'

type Rect = { x: number; y: number; w: number; h: number }

// Min Y for tiled windows: just below the menubar with a small clearance gap.
const TILE_TOP = MENUBAR_H + 4
const DOCK_RESERVE = 80
const TILE_STEP = 24
const MARGIN = 8

/**
 * Scan a grid of candidate positions and return the first one where a window
 * of `size` fits without overlapping any rect in `existing`. Falls back to a
 * cascade offset when no slot fits.
 *
 * Two passes: strict (leaves room for the dock), then relaxed (allows the
 * window bottom to extend behind the dock if nothing fits otherwise).
 */
/**
 * Reserved zones for desktop widgets so the tile finder doesn't drop new
 * windows on top of them. Kept in lockstep with components/desktop/*.
 *  - Left: stack of file/folder icons under DesktopIcons (top-10 left-3, w-20 tiles).
 *  - Right: QrVCard (top-12 right-4, w-[140px]).
 */
function desktopReservedRects(viewW: number): Rect[] {
  return [
    { x: 0, y: 32, w: 112, h: 360 },
    { x: viewW - 168, y: 40, w: 168, h: 220 },
  ]
}

function findTilePosition(
  size: { w: number; h: number },
  existing: Rect[],
): { x: number; y: number } {
  if (typeof window === 'undefined') return { x: 120, y: 80 }
  const viewW = window.innerWidth
  const viewH = window.innerHeight
  const obstacles: Rect[] = [...desktopReservedRects(viewW), ...existing]

  function scan(bottom: number): { x: number; y: number } | null {
    for (let y = TILE_TOP; y + size.h <= bottom; y += TILE_STEP) {
      for (let x = MARGIN; x + size.w <= viewW - MARGIN; x += TILE_STEP) {
        const overlaps = obstacles.some(
          (e) => x < e.x + e.w && x + size.w > e.x && y < e.y + e.h && y + size.h > e.y,
        )
        if (!overlaps) return { x, y }
      }
    }
    return null
  }

  const strict = scan(viewH - DOCK_RESERVE)
  if (strict) return strict
  const relaxed = scan(viewH - MARGIN)
  if (relaxed) return relaxed
  // Nothing fits — cascade behind whatever's there.
  const offset = existing.length * 24
  return { x: 120 + offset, y: 80 + offset }
}

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
    // Only `normal` windows occupy screen real estate — minimized are hidden,
    // and fullscreen/max already cover everything so tiling around them is
    // pointless (the new window will sit on top via z anyway).
    const visibleRects: Rect[] = get()
      .windows.filter((win) => win.state === 'normal')
      .map((win) => ({
        x: win.position.x,
        y: win.position.y,
        w: win.size.w,
        h: win.size.h,
      }))
    const position = findTilePosition(manifest.defaultSize, visibleRects)
    const w: WindowState = {
      id,
      appId,
      position,
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
