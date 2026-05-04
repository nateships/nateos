'use client'
import { useEffect, useState } from 'react'
import { byId } from '@/lib/os/registry'
import { useWindowStore } from '@/lib/os/window-store'
import { AppleLogo } from './AppleLogo'
import { BatteryIcon, SpotlightIcon, WifiIcon } from './SystemIcons'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])
  return now.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function Menubar() {
  const focusedId = useWindowStore((s) => s.focusedId)
  const windows = useWindowStore((s) => s.windows)
  const focusedApp = focusedId ? byId[windows.find((w) => w.id === focusedId)?.appId ?? ''] : null
  const time = useClock()

  return (
    <div
      className="fixed top-0 inset-x-0 h-7 z-50 flex items-center px-3 gap-4 text-white text-[12px] font-medium border-b border-white/10"
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(255,255,255,0.18)',
      }}
    >
      <AppleLogo size={14} className="text-white" />
      <strong className="tracking-tight">{focusedApp?.title ?? 'NateOS'}</strong>
      <span className="opacity-90">File</span>
      <span className="opacity-90">Edit</span>
      <span className="opacity-90">View</span>
      <span className="opacity-90">Window</span>
      <span className="opacity-90">Help</span>
      <span className="ml-auto flex items-center gap-3 text-white">
        <SpotlightIcon size={14} />
        <WifiIcon size={16} />
        <span className="flex items-center gap-1">
          <BatteryIcon size={22} level={0.87} />
          <span className="text-[11px] opacity-90">87%</span>
        </span>
        <span>{time}</span>
      </span>
    </div>
  )
}
