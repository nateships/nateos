'use client'
import { useEffect, useLayoutEffect } from 'react'
import { useWindowStore } from '@/lib/os/window-store'
import { Window } from './Window'

export function WindowLayer() {
  const windows = useWindowStore((s) => s.windows)
  const sorted = [...windows].sort((a, b) => a.z - b.z)
  // Mark <html> when any window is in fullscreen so globals.css can hide the
  // menubar + dock, matching real macOS fullscreen (which moves the window
  // into its own Space and hides the bars). useLayoutEffect runs before the
  // browser paints so the bars vanish in the same frame the window expands —
  // a plain useEffect leaves a one-frame flash of overlapping chrome.
  const anyFullscreen = windows.some((w) => w.state === 'fullscreen')
  useLayoutEffect(() => {
    const root = document.documentElement
    if (anyFullscreen) root.dataset.fullscreen = 'true'
    else delete root.dataset.fullscreen
  }, [anyFullscreen])
  // ESC exits fullscreen — but only if no inner component (Snake game,
  // dialogs, inputs) has already claimed the keypress via preventDefault.
  // Without this, an in-flight ESC could exit Snake AND fullscreen on the
  // same press.
  useEffect(() => {
    if (!anyFullscreen) return
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      const { windows: ws, setWindowState } = useWindowStore.getState()
      const fs = ws.find((w) => w.state === 'fullscreen')
      if (fs) setWindowState(fs.id, 'normal')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [anyFullscreen])
  return (
    // pointer-events-none lets clicks fall through to desktop icons in the
    // gaps between windows. Each Window's root re-enables events on itself.
    <div className="absolute inset-0 pt-7 pointer-events-none z-20">
      {sorted.map((w) => (
        <Window key={w.id} windowId={w.id} />
      ))}
    </div>
  )
}
