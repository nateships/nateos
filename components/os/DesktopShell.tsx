'use client'
import { Suspense } from 'react'
import { DeeplinkRouter } from '@/components/deeplink/DeeplinkRouter'
import { DesktopWidgets } from '@/components/desktop/DesktopWidgets'
import { MobileShell } from '@/components/mobile/MobileShell'
import { useViewport } from '@/lib/os/use-viewport'
import { Dock } from './Dock'
import { KernelPanic } from './KernelPanic'
import { LockScreen } from './LockScreen'
import { Menubar } from './Menubar'
import { Wallpaper } from './Wallpaper'
import { WindowLayer } from './WindowLayer'

export function DesktopShell({ children }: { children: React.ReactNode }) {
  const { isMobile } = useViewport()

  return (
    <>
      {isMobile ? (
        <MobileShell />
      ) : (
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
      )}
      {/*
       * KernelPanic + LockScreen mount on every route (and on both viewports)
       * so deeplinks like /terminal can still trigger them. HomeClient only
       * renders on /, so previously sudo from a deeplink-launched terminal
       * was a no-op.
       */}
      <KernelPanic />
      <LockScreen />
    </>
  )
}
