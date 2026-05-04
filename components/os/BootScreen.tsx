'use client'
import { useEffect, useState } from 'react'

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const total = 1200
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
  }, [onDone])

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center gap-6 text-white">
      <span className="text-7xl">🍎</span>
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
