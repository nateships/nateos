'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useScreenStore } from '@/lib/os/screen-store'
import { useSettings } from '@/lib/settings/store'

function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}
function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

/**
 * Full-screen overlay shown above all desktop chrome when the screen is
 * locked or sleeping. Click or any keypress dismisses (real macOS prompts
 * for a password — we trust the visitor).
 */
export function LockScreen() {
  const screen = useScreenStore((s) => s.screen)
  const setScreen = useScreenStore((s) => s.setScreen)
  const wallpaper = useSettings((s) => s.wallpaper)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (screen !== 'locked') return
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [screen])

  useEffect(() => {
    if (screen === 'on') return
    function onKey() {
      setScreen('on')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, setScreen])

  if (screen === 'on') return null

  if (screen === 'sleeping') {
    return (
      <button
        type="button"
        aria-label="Wake"
        onClick={() => setScreen('on')}
        className="fixed inset-0 z-[300] bg-black cursor-default"
      />
    )
  }

  return (
    <button
      type="button"
      aria-label="Unlock screen"
      onClick={() => setScreen('on')}
      className="fixed inset-0 z-[300] cursor-default text-white text-left"
    >
      <Image src={wallpaper} alt="" fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative h-full flex flex-col items-center justify-center pointer-events-none select-none">
        <div className="text-[14px] opacity-80 tracking-wide">{fmtDate(now)}</div>
        <div className="text-[120px] font-extralight leading-none tracking-tight tabular-nums mt-2">
          {fmtTime(now)}
        </div>
        <div className="mt-14 w-16 h-16 rounded-full border-2 border-white/40 bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl font-light">
          n
        </div>
        <div className="text-[13px] mt-3 font-medium">nate</div>
        <div className="text-[11px] opacity-60 mt-6">Click or press any key to unlock</div>
      </div>
    </button>
  )
}
