'use client'
import { type PointerEvent as RP, useRef, useState } from 'react'
import { byId } from '@/lib/os/registry'
import { useWindowStore } from '@/lib/os/window-store'

export function Window({ windowId }: { windowId: string }) {
  const w = useWindowStore((s) => s.windows.find((x) => x.id === windowId))
  const focusWindow = useWindowStore((s) => s.focusWindow)
  const closeWindow = useWindowStore((s) => s.closeWindow)
  const moveWindow = useWindowStore((s) => s.moveWindow)
  const setState = useWindowStore((s) => s.setWindowState)

  const dragRef = useRef<{ dx: number; dy: number } | null>(null)
  const [, force] = useState(0)

  if (!w) return null
  const manifest = byId[w.appId]
  if (!manifest) return null
  const Comp = manifest.component

  function onPointerDown(e: RP<HTMLDivElement>) {
    if (!w) return
    focusWindow(w.id)
    dragRef.current = { dx: e.clientX - w.position.x, dy: e.clientY - w.position.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: RP<HTMLDivElement>) {
    if (!dragRef.current || !w) return
    moveWindow(w.id, { x: e.clientX - dragRef.current.dx, y: e.clientY - dragRef.current.dy })
  }
  function onPointerUp() {
    dragRef.current = null
    force((n) => n + 1)
  }

  if (w.state === 'min') return null

  const style: React.CSSProperties =
    w.state === 'fullscreen' || w.state === 'max'
      ? { top: 28, left: 0, right: 0, bottom: 0, position: 'absolute', zIndex: w.z }
      : {
          position: 'absolute',
          left: w.position.x,
          top: w.position.y,
          width: w.size.w,
          height: w.size.h,
          zIndex: w.z,
        }

  return (
    <div
      style={style}
      className="rounded-xl overflow-hidden border border-white/10 shadow-2xl text-white/90"
    >
      <div
        role="toolbar"
        className="h-7 px-3 flex items-center gap-2 border-b border-white/10 select-none cursor-default"
        style={{ backdropFilter: 'blur(40px)', background: 'rgba(40,40,46,0.78)' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => setState(w.id, w.state === 'max' ? 'normal' : 'max')}
      >
        <span className="flex gap-1.5">
          <button
            type="button"
            aria-label="Close"
            className="w-3 h-3 rounded-full bg-[#ff5f57]"
            onClick={(e) => {
              e.stopPropagation()
              closeWindow(w.id)
            }}
          />
          <button
            type="button"
            aria-label="Minimize"
            className="w-3 h-3 rounded-full bg-[#febc2e]"
            onClick={(e) => {
              e.stopPropagation()
              setState(w.id, 'min')
            }}
          />
          <button
            type="button"
            aria-label="Maximize"
            className="w-3 h-3 rounded-full bg-[#28c840]"
            onClick={(e) => {
              e.stopPropagation()
              setState(w.id, w.state === 'max' ? 'normal' : 'max')
            }}
          />
        </span>
        <span className="mx-auto -translate-x-4 text-xs opacity-70">{manifest.title}</span>
      </div>
      <div
        className="h-[calc(100%-1.75rem)] overflow-auto"
        style={{ background: 'rgba(40,40,46,0.78)' }}
      >
        <Comp windowId={w.id} params={w.params} />
      </div>
    </div>
  )
}
