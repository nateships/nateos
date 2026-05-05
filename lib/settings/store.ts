'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppearanceMode = 'light' | 'dark' | 'auto'

type SettingsState = {
  appearance: AppearanceMode
  wallpaper: string
  reduceMotion: boolean
  setAppearance(mode: AppearanceMode): void
  setWallpaper(path: string): void
  setReduceMotion(v: boolean): void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      appearance: 'dark',
      wallpaper: '/apple/wallpapers/nateos-big-sur-dark.jpg',
      reduceMotion: false,
      setAppearance: (mode) => set({ appearance: mode }),
      setWallpaper: (path) => set({ wallpaper: path }),
      setReduceMotion: (v) => set({ reduceMotion: v }),
    }),
    { name: 'nateos.settings' },
  ),
)
