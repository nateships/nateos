'use client'
import { useEffect, useState } from 'react'

const KEY = 'nateos.mobile_hint_dismissed'

/**
 * Small banner shown above the mobile tab bar nudging visitors to open the
 * site on desktop for the full OS-style experience. Dismissable; choice is
 * persisted in localStorage so we don't pester returning users.
 */
export function MobileDesktopHint() {
  const [dismissed, setDismissed] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(KEY) === '1')
    } catch {
      setDismissed(false)
    }
  }, [])

  function dismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      // localStorage may be blocked; in-memory dismissal still works for the session.
    }
  }

  if (dismissed !== false) return null

  return (
    <div className="fixed bottom-16 inset-x-0 z-40 flex items-center justify-between gap-3 px-4 h-9 border-t border-white/10 bg-zinc-950/85 backdrop-blur-md text-[11px]">
      <span className="text-white/80 leading-tight">
        For the full NateOS experience, visit{' '}
        <span className="font-semibold text-blue-400">nate.cx</span> on desktop.
      </span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="text-white/50 hover:text-white/90 text-base leading-none px-1"
      >
        ×
      </button>
    </div>
  )
}
