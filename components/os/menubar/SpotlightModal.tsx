'use client'
import { useEffect, useRef, useState } from 'react'
import { SpotlightIcon } from '../SystemIcons'

type Props = {
  open: boolean
  onClose: () => void
}

/**
 * Centered macOS Spotlight-style search modal.
 * - Esc or backdrop click closes.
 * - Input autofocuses on open. Submit is a no-op for v1.
 */
export function SpotlightModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Reset query each time it opens; focus input.
  useEffect(() => {
    if (!open) return
    setQuery('')
    // Focus on next tick to ensure input is mounted.
    const id = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(id)
  }, [open])

  // Escape close.
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
      className="fixed inset-0 z-[70] flex items-start justify-center pt-[18vh] bg-black/30 backdrop-blur-sm"
      onMouseDown={(event) => {
        // Only close if backdrop itself was clicked, not the panel.
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight Search"
        className="w-[640px] max-w-[88vw] rounded-2xl border border-white/10 shadow-2xl backdrop-blur-2xl bg-zinc-900/85 text-white overflow-hidden"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            // v1: no-op submit.
          }}
          className="flex items-center gap-3 px-5 py-4"
        >
          <SpotlightIcon size={22} className="opacity-80" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent text-[22px] leading-none placeholder:text-white/40 focus:outline-none"
            aria-label="Spotlight Search"
          />
        </form>
      </div>
    </div>
  )
}
