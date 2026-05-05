'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppearanceMode = 'light' | 'dark' | 'auto'
export type Era = 'tahoe' | 'classic'

type SettingsState = {
  appearance: AppearanceMode
  wallpaper: string
  reduceMotion: boolean
  era: Era
  setAppearance(mode: AppearanceMode): void
  setWallpaper(path: string): void
  setReduceMotion(v: boolean): void
  setEra(era: Era): void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      appearance: 'dark',
      wallpaper: '/apple/wallpapers/nateos-big-sur-dark.jpg',
      reduceMotion: false,
      era: 'tahoe',
      setAppearance: (mode) => set({ appearance: mode }),
      setWallpaper: (path) => set({ wallpaper: path }),
      setReduceMotion: (v) => set({ reduceMotion: v }),
      setEra: (era) => set({ era }),
    }),
    { name: 'nateos.settings' },
  ),
)
