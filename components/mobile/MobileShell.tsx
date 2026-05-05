'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { byId } from '@/lib/os/registry'
import { MobileDesktopHint } from './MobileDesktopHint'
import { MobileTabBar, type Tab, type TabId } from './MobileTabBar'

const TAB_IDS: TabId[] = ['resume', 'projects', 'calendar', 'messages', 'safari', 'terminal']

const TAB_LABELS: Record<TabId, string> = {
  resume: 'Resume',
  projects: 'Projects',
  calendar: 'Book',
  messages: 'Contact',
  safari: 'Links',
  terminal: 'Terminal',
}

function tabFromPath(pathname: string): TabId | null {
  const seg = pathname.split('/').filter(Boolean)[0]
  if (!seg) return null
  return TAB_IDS.includes(seg as TabId) ? (seg as TabId) : null
}

export function MobileShell() {
  const pathname = usePathname()
  const [active, setActive] = useState<TabId>(() => tabFromPath(pathname) ?? 'resume')

  useEffect(() => {
    const t = tabFromPath(pathname)
    if (t) setActive(t)
  }, [pathname])

  const tabs: Tab[] = TAB_IDS.map((id) => {
    const m = byId[id]
    return {
      id,
      label: TAB_LABELS[id],
      Icon: m?.icon ?? (() => null),
    }
  })

  const activeApp = byId[active]
  const ActiveComponent = activeApp?.component

  return (
    <div className="fixed inset-0 flex flex-col bg-zinc-900 text-white">
      <header className="flex items-center justify-center h-10 border-b border-white/10 bg-zinc-900/95">
        <span className="text-[13px] font-semibold tracking-tight">{TAB_LABELS[active]}</span>
      </header>
      <main className="flex-1 overflow-hidden pb-[6.25rem]">
        {ActiveComponent ? <ActiveComponent windowId={`mobile-${active}`} /> : null}
      </main>
      <MobileDesktopHint />
      <MobileTabBar tabs={tabs} active={active} onSelect={setActive} />
    </div>
  )
}
