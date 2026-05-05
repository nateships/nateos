'use client'
import type { ComponentType } from 'react'

export type TabId = 'resume' | 'projects' | 'messages' | 'safari' | 'terminal'

export type Tab = {
  id: TabId
  label: string
  Icon: ComponentType<{ size?: number }>
}

type Props = {
  tabs: Tab[]
  active: TabId
  onSelect: (id: TabId) => void
}

export function MobileTabBar({ tabs, active, onSelect }: Props) {
  return (
    <nav
      aria-label="App tabs"
      className="fixed bottom-0 inset-x-0 z-50 flex items-stretch h-16 border-t border-white/10"
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(20,20,24,0.85)',
      }}
    >
      {tabs.map((t) => {
        const isActive = t.id === active
        return (
          <button
            key={t.id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onSelect(t.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 ${
              isActive ? 'text-blue-400' : 'text-white/60'
            }`}
          >
            <t.Icon size={22} />
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
