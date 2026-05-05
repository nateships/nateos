'use client'
import { create } from 'zustand'

export type ScreenState = 'on' | 'locked' | 'sleeping'

type Store = {
  screen: ScreenState
  setScreen(s: ScreenState): void
}

/**
 * Tracks whether the OS is fully visible, locked behind the lock screen, or
 * "asleep" (display blanked). Not persisted — refreshing the page should
 * always come up unlocked.
 */
export const useScreenStore = create<Store>((set) => ({
  screen: 'on',
  setScreen: (s) => set({ screen: s }),
}))
