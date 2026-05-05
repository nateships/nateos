'use client'
import { useEffect, useState } from 'react'
import { BootScreen } from '@/components/os/BootScreen'
import { KernelPanic } from '@/components/os/KernelPanic'
import { useWindowStore } from '@/lib/os/window-store'

const KEY = 'nateos_booted'

export function HomeClient() {
  // Always start booting=true so the boot screen overlays the wallpaper on
  // cold paint (no flash). A useEffect short-circuits past it if we've
  // already booted this session.
  const [booting, setBooting] = useState<boolean>(true)
  const openApp = useWindowStore((s) => s.openApp)
  const windows = useWindowStore((s) => s.windows)

  useEffect(() => {
    if (sessionStorage.getItem(KEY) === '1') {
      setBooting(false)
      ensureTerminal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function ensureTerminal() {
    if (!windows.find((w) => w.appId === 'terminal')) {
      openApp('terminal')
    }
  }

  function onBootDone() {
    sessionStorage.setItem(KEY, '1')
    setBooting(false)
    ensureTerminal()
  }

  return (
    <>
      <KernelPanic />
      {booting ? <BootScreen onDone={onBootDone} /> : null}
    </>
  )
}
