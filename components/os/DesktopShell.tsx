'use client'
import { Suspense } from 'react'
import { DeeplinkRouter } from '@/components/deeplink/DeeplinkRouter'
import { DesktopWidgets } from '@/components/desktop/DesktopWidgets'
import { MobileShell } from '@/components/mobile/MobileShell'
import { useViewport } from '@/lib/os/use-viewport'
import { Dock } from './Dock'
import { Menubar } from './Menubar'
import { Wallpaper } from './Wallpaper'
import { WindowLayer } from './WindowLayer'

export function DesktopShell({ children }: { children: React.ReactNode }) {
  const { isMobile } = useViewport()

  if (isMobile) {
    return <MobileShell />
  }

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
