'use client'
import { useEffect, useState } from 'react'
import { useSettings } from '@/lib/settings/store'
import { AppleLogo } from './AppleLogo'

export function BootScreen({ onDone }: { onDone: () => void }) {
  const era = useSettings((s) => s.era)
  const reduceMotion = useSettings((s) => s.reduceMotion)
  const [pct, setPct] = useState(0)
  const total = reduceMotion ? 200 : 1200

  useEffect(() => {
    const start = Date.now()
    const t = setInterval(() => {
      const elapsed = Date.now() - start
      const p = Math.min(100, (elapsed / total) * 100)
      setPct(p)
      if (p >= 100) {
        clearInterval(t)
        onDone()
      }
    }, 30)
    const onClick = () => onDone()
    window.addEventListener('click', onClick, { once: true })
    return () => {
      clearInterval(t)
      window.removeEventListener('click', onClick)
    }
  }, [onDone, total])

  if (era === 'classic') {
    return (
      <div className="fixed inset-0 z-[100] bg-[#c0c0c0] flex flex-col items-center justify-center gap-6 text-black font-mono">
        <div className="flex flex-col items-center gap-3 px-8 py-6 border-2 border-black bg-white">
          <span className="text-5xl">🙂</span>
          <p className="text-[14px] tracking-tight">Welcome to NateOS.</p>
        </div>
        <div className="w-48 h-2 border border-black bg-white overflow-hidden">
          <div
            className="h-full bg-black transition-[width] duration-100"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] opacity-60">click to skip</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center gap-6 text-white">
      <AppleLogo size={88} className="text-white" />
      <div className="w-48 h-1 bg-white/15 rounded-full overflow-hidden">
        <div
          className="h-full bg-white/85 transition-[width] duration-100"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] opacity-50">click to skip</p>
    </div>
  )
}
