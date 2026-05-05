'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AccentColor =
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'graphite'

export type DockSize = 'small' | 'medium' | 'large'

type SettingsState = {
  accentColor: AccentColor
  wallpaper: string
  reduceMotion: boolean
  /** 0 = fully solid surfaces, 100 = maximum glass blur. Default tuned lower than full glass. */
  transparency: number
  dockSize: DockSize
  setAccentColor(c: AccentColor): void
  setWallpaper(path: string): void
  setReduceMotion(v: boolean): void
  setTransparency(v: number): void
  setDockSize(s: DockSize): void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      accentColor: 'blue',
      wallpaper: '/apple/wallpapers/nateos-big-sur-dark.jpg',
      reduceMotion: false,
      transparency: 100,
      dockSize: 'medium',
      setAccentColor: (c) => set({ accentColor: c }),
      setWallpaper: (path) => set({ wallpaper: path }),
      setReduceMotion: (v) => set({ reduceMotion: v }),
      setTransparency: (v) => set({ transparency: Math.max(0, Math.min(100, v)) }),
      setDockSize: (s) => set({ dockSize: s }),
    }),
    { name: 'nateos.settings' },
  ),
)

// Accent ramp values (500 = base, 400 = hover). Chosen to mirror Tailwind hues
// where possible so the rest of the chrome reads the recolored token.
export const ACCENT_RAMP: Record<AccentColor, { c500: string; c400: string }> = {
  blue: { c500: 'oklch(62.3% 0.214 259.815)', c400: 'oklch(70.7% 0.165 254.624)' },
  purple: { c500: 'oklch(62.7% 0.265 303.9)', c400: 'oklch(71.4% 0.203 305.504)' },
  pink: { c500: 'oklch(65.6% 0.241 354.308)', c400: 'oklch(71.8% 0.202 349.761)' },
  red: { c500: 'oklch(63.7% 0.237 25.331)', c400: 'oklch(70.4% 0.191 22.216)' },
  orange: { c500: 'oklch(70.5% 0.213 47.604)', c400: 'oklch(75% 0.183 55.934)' },
  yellow: { c500: 'oklch(79.5% 0.184 86.047)', c400: 'oklch(85.2% 0.199 91.936)' },
  green: { c500: 'oklch(72.3% 0.219 149.579)', c400: 'oklch(79.2% 0.209 151.711)' },
  graphite: { c500: 'oklch(55.2% 0.016 285.938)', c400: 'oklch(70.5% 0.015 286.067)' },
}
