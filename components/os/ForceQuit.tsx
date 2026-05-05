'use client'
import { useEffect, useState } from 'react'
import { byId } from '@/lib/os/registry'
import { useWindowStore } from '@/lib/os/window-store'

export function ForceQuit() {
  const [open, setOpen] = useState(false)
  const windows = useWindowStore((s) => s.windows)
  const closeWindow = useWindowStore((s) => s.closeWindow)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Cmd+Opt+Esc on macOS, Ctrl+Alt+Esc on others
      if (e.key === 'Escape' && e.altKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  const visibleWins = windows.filter((w) => w.state !== 'min')

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click-to-close is standard modal behavior
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false)
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Force Quit Applications"
        className="w-[380px] rounded-2xl border border-white/10 shadow-2xl backdrop-blur-2xl bg-zinc-900/90 text-white overflow-hidden"
      >
        <header className="px-5 py-3 border-b border-white/10">
          <h2 className="text-[14px] font-semibold">Force Quit Applications</h2>
          <p className="text-[11px] opacity-60 mt-0.5">
            If an app doesn't respond for a while, select its name and click Force Quit.
          </p>
        </header>
        <ul className="max-h-[260px] overflow-auto os-scroll py-1">
          {visibleWins.length === 0 ? (
            <li className="px-5 py-6 text-center opacity-60 text-[12px]">
              Nothing to quit. (Not Responding)
            </li>
          ) : (
            visibleWins.map((w) => {
              const m = byId[w.appId]
              if (!m) return null
              const isActive = selectedId === w.id
              return (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(w.id)}
                    className={`w-full text-left px-5 py-1.5 text-[13px] flex items-center gap-3 ${
                      isActive ? 'bg-blue-500/80 text-white' : 'hover:bg-white/5'
                    }`}
                  >
                    <m.icon size={20} />
                    <span className="flex-1">{m.title}</span>
                    {w.appId === 'terminal' ? (
                      <span className="text-[10px] opacity-50">(Not Responding)</span>
                    ) : null}
                  </button>
                </li>
              )
            })
          )}
        </ul>
        <footer className="px-5 py-3 border-t border-white/10 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-[12px]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedId}
            onClick={() => {
              if (selectedId) closeWindow(selectedId)
              setSelectedId(null)
              setOpen(false)
            }}
            className="px-3 py-1.5 rounded-md bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-[12px] font-medium"
          >
            Force Quit
          </button>
        </footer>
      </div>
    </div>
  )
}
