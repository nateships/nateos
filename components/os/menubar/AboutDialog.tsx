'use client'
import { useEffect } from 'react'
import { NATEOS_VERSION } from '@/lib/version'
import { AppleLogo } from '../AppleLogo'

type Props = {
  open: boolean
  onClose: () => void
}

/** Centered "About This Mac"-style dialog. */
export function AboutDialog({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

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
        aria-label="About NateOS"
        className="w-[420px] max-w-[88vw] rounded-2xl border border-white/10 shadow-2xl backdrop-blur-2xl bg-zinc-900/85 text-white overflow-hidden"
      >
        <div className="flex flex-col items-center gap-3 px-8 py-7 text-center">
          <AppleLogo size={48} className="text-white" />
          <h2 className="text-lg font-semibold tracking-tight">NateOS</h2>
          <p className="text-[12px] opacity-80">{NATEOS_VERSION}</p>
          <p className="text-[11px] opacity-60 mt-2">A portfolio styled as a desktop OS.</p>
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
