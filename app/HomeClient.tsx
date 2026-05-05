'use client'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BootScreen } from '@/components/os/BootScreen'
import { KernelPanic } from '@/components/os/KernelPanic'
import { useWindowStore } from '@/lib/os/window-store'

const KEY = 'nateos_booted'

/**
 * Read fresh window state via getState() so we don't fire a duplicate
 * openApp when the render-time `windows` closure is stale (e.g. on the
 * same commit as DeeplinkRouter opening /terminal). Terminal is
 * multi-instance, so the store can't dedupe for us.
 */
function ensureTerminal() {
  const { windows, openApp } = useWindowStore.getState()
  if (!windows.find((w) => w.appId === 'terminal')) {
    openApp('terminal')
  }
}

export function HomeClient() {
  // Always start booting=true so the boot screen overlays the wallpaper on
  // cold paint (no flash). A useEffect short-circuits past it if we've
  // already booted this session.
  const [booting, setBooting] = useState<boolean>(true)
  const pathname = usePathname()
  // Mirror pathname into a ref so onBootDone can be a stable callback —
  // BootScreen depends on it via useEffect deps and recreating it would
  // restart the progress animation.
  const pathRef = useRef(pathname)
  pathRef.current = pathname

  useEffect(() => {
    if (sessionStorage.getItem(KEY) === '1') {
      setBooting(false)
      // Only auto-open terminal on the root path; deeplinks like /terminal,
      // /resume etc. are handled by DeeplinkRouter.
      if (pathname === '/' || pathname === '') ensureTerminal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onBootDone = useCallback(() => {
    sessionStorage.setItem(KEY, '1')
    setBooting(false)
    const p = pathRef.current
    if (p === '/' || p === '') ensureTerminal()
  }, [])

  return (
    <>
      <KernelPanic />
      {booting ? <BootScreen onDone={onBootDone} /> : null}
    </>
  )
}
