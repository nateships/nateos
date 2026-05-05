'use client'
import { useEffect, useState } from 'react'
import { BootScreen } from '@/components/os/BootScreen'
import { EraClass } from '@/components/os/EraClass'
import { KonamiTrigger } from '@/components/os/KonamiTrigger'
import { useWindowStore } from '@/lib/os/window-store'

const KEY = 'nateos_booted'

export function HomeClient() {
  const [booting, setBooting] = useState<boolean>(false)
  const openApp = useWindowStore((s) => s.openApp)
  const windows = useWindowStore((s) => s.windows)

  useEffect(() => {
    const already = sessionStorage.getItem(KEY) === '1'
    if (already) {
      ensureTerminal()
    } else {
      setBooting(true)
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
      <EraClass />
      <KonamiTrigger />
      {booting ? <BootScreen onDone={onBootDone} /> : null}
    </>
  )
}
