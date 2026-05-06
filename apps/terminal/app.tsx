'use client'
import type { AppContext } from '@/lib/os/types'
import { useWindowStore } from '@/lib/os/window-store'
import { Term } from './Term'

export function TerminalApp(_ctx: AppContext) {
  const openApp = useWindowStore((s) => s.openApp)
  return <Term ctx={{ openApp }} />
}
