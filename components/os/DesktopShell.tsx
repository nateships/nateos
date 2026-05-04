'use client'
import { Dock } from './Dock'
import { Menubar } from './Menubar'
import { Wallpaper } from './Wallpaper'
import { WindowLayer } from './WindowLayer'

export function DesktopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Wallpaper />
      <Menubar />
      <WindowLayer />
      <Dock />
      {children}
    </div>
  )
}
