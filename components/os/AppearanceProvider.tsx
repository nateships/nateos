'use client'
import { useEffect } from 'react'
import { ACCENT_RAMP, useSettings } from '@/lib/settings/store'

/**
 * Mounts no DOM but applies persisted appearance settings to <html>:
 *  - Overrides --color-blue-500/--color-blue-400 so every `bg-blue-500` etc.
 *    retints to the chosen accent (Tailwind v4 emits these as CSS vars).
 *  - Sets --os-glass-* CSS vars from the transparency slider so .os-glass-*
 *    surfaces interpolate between solid (t=0) and full glass (t=100).
 *  - Sets data-dock-size for Dock.tsx to size icons off of.
 */
export function AppearanceProvider() {
  const accent = useSettings((s) => s.accentColor)
  const transparency = useSettings((s) => s.transparency)
  const dockSize = useSettings((s) => s.dockSize)

  useEffect(() => {
    const root = document.documentElement
    const ramp = ACCENT_RAMP[accent]
    root.style.setProperty('--color-blue-500', ramp.c500)
    root.style.setProperty('--color-blue-400', ramp.c400)
    root.dataset.accent = accent
  }, [accent])

  useEffect(() => {
    const root = document.documentElement
    const t = Math.max(0, Math.min(100, transparency)) / 100
    // Light surfaces (menubar, dock): 95% solid → 25% at full glass.
    const lightPct = 95 - 70 * t
    // Dark surfaces (window chrome, terminal, app bodies): 95% solid → 45%
    // at full glass. Wide enough that the slider visibly retints app windows
    // (was 7.8% range, effectively invisible) while still readable at any
    // position thanks to the dark base color.
    const darkPct = 95 - 50 * t
    const blurPx = 30 * t
    const darkBlurPx = 18 * t
    root.style.setProperty('--os-glass-light', `${lightPct}%`)
    root.style.setProperty('--os-glass-dark', `${darkPct}%`)
    root.style.setProperty('--os-glass-blur', `${blurPx}px`)
    root.style.setProperty('--os-glass-blur-dark', `${darkBlurPx}px`)
    // Light surfaces fade from near-white (solid) to translucent over a dark
    // wallpaper as the slider rises. Foreground has to track that: black at
    // slider=0 (light bg → dark text) lerping to white at slider=100 (glass
    // bg → light text). Linear lerp in sRGB is fine for grayscale endpoints.
    const fgLight = `color-mix(in srgb, white ${t * 100}%, black)`
    root.style.setProperty('--os-fg-on-light', fgLight)
  }, [transparency])

  useEffect(() => {
    document.documentElement.dataset.dockSize = dockSize
  }, [dockSize])

  return null
}
