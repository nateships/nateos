'use client'
import type { AppContext } from '@/lib/os/types'
import { useWindowStore } from '@/lib/os/window-store'
import { Term } from './Term'

export function TerminalApp(_ctx: AppContext) {
  const openApp = useWindowStore((s) => s.openApp)
  const closeWindow = useWindowStore((s) => s.closeWindow)
  return <Term ctx={{ openApp, closeWindow }} />
}
