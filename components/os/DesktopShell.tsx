'use client'
import { Suspense } from 'react'
import { DeeplinkRouter } from '@/components/deeplink/DeeplinkRouter'
import { DesktopWidgets } from '@/components/desktop/DesktopWidgets'
import { Dock } from './Dock'
import { Menubar } from './Menubar'
import { Wallpaper } from './Wallpaper'
import { WindowLayer } from './WindowLayer'

export function DesktopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Wallpaper />
      <Menubar />
      <DesktopWidgets />
      <WindowLayer />
      <Dock />
      <Suspense fallback={null}>
        <DeeplinkRouter />
      </Suspense>
      {children}
    </div>
  )
}
