'use client'
import { registry } from '@/lib/os/registry'
import { useWindowStore } from '@/lib/os/window-store'

export function Dock() {
  const windows = useWindowStore((s) => s.windows)
  const focusedId = useWindowStore((s) => s.focusedId)
  const openApp = useWindowStore((s) => s.openApp)
  const focusWindow = useWindowStore((s) => s.focusWindow)
  const setWindowState = useWindowStore((s) => s.setWindowState)
  const runningIds = new Set(windows.map((w) => w.appId))

  // macOS convention: Finder pinned to the far left.
  const dockApps = registry
    .filter((m) => m.surfaces.includes('dock') && !m.disabled)
    .sort((a, b) => {
      if (a.id === 'finder') return -1
      if (b.id === 'finder') return 1
      return 0
    })

  return (
    <div
      className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 flex gap-1.5 px-2 py-1.5 rounded-2xl border border-white/20"
      style={{
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        background: 'rgba(255,255,255,0.18)',
      }}
    >
      {dockApps.map((m) => {
        const Icon = m.icon
        const isRunning = runningIds.has(m.id)
        return (
          <button
            key={m.id}
            type="button"
            aria-label={m.title}
            className="group relative w-12 h-12 rounded-lg flex items-center justify-center transition-transform hover:scale-110 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            onClick={() => {
              const existing = windows.find((w) => w.appId === m.id)
              if (!existing) {
                openApp(m.id)
                return
              }
              if (existing.state === 'min') {
                setWindowState(existing.id, 'normal')
                focusWindow(existing.id)
                return
              }
              if (focusedId === existing.id) {
                // Already frontmost — minimize (macOS behavior).
                setWindowState(existing.id, 'min')
                return
              }
              focusWindow(existing.id)
            }}
          >
            <Icon size={44} />
            {isRunning && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
            )}
            {/* macOS-style tooltip above the icon, fades in on hover */}
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-2 py-1 rounded-md border border-white/10 backdrop-blur-md bg-zinc-900/85 text-white text-[11px] font-medium whitespace-nowrap shadow-lg opacity-0 translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0"
            >
              {m.title}
              <span
                aria-hidden="true"
                className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 rotate-45 bg-zinc-900/85 border-r border-b border-white/10"
              />
            </span>
          </button>
        )
      })}
    </div>
  )
}
