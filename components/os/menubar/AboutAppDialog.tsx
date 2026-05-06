'use client'
import { useEffect } from 'react'
import type { AppManifest } from '@/lib/os/types'
import { NATEOS_VERSION } from '@/lib/version'

type Props = {
  app: AppManifest | null
  onClose: () => void
}

export function AboutAppDialog({ app, onClose }: Props) {
  useEffect(() => {
    if (!app) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [app, onClose])

  if (!app) return null
  const Icon = app.icon

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click-to-close is standard modal behavior
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center pt-[20vh] bg-black/30 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`About ${app.title}`}
        className="w-[420px] max-w-[88vw] rounded-2xl border border-white/10 shadow-2xl backdrop-blur-2xl bg-zinc-900/85 text-white overflow-hidden"
      >
        <div className="flex flex-col items-center gap-3 px-8 py-7 text-center">
          <Icon size={64} />
          <h2 className="text-lg font-semibold tracking-tight">{app.title}</h2>
          <p className="text-[11px] opacity-60">NateOS · {NATEOS_VERSION}</p>
          <p className="text-[12px] opacity-85 mt-2 leading-relaxed">
            {app.description ?? 'Part of NateOS.'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 px-5 py-1.5 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
