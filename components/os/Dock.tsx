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

  const dockApps = registry.filter((m) => m.surfaces.includes('dock') && !m.disabled)

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
            title={m.title}
            className="relative w-12 h-12 rounded-lg flex items-center justify-center transition-transform hover:scale-110 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white/60"
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
          </button>
        )
      })}
    </div>
  )
}
