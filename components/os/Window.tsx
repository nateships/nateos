'use client'
import { type PointerEvent as RP, useRef, useState } from 'react'
import { byId } from '@/lib/os/registry'
import { useWindowStore } from '@/lib/os/window-store'

type ResizeEdge = 'right' | 'bottom' | 'corner'

export function Window({ windowId }: { windowId: string }) {
  const w = useWindowStore((s) => s.windows.find((x) => x.id === windowId))
  const focusWindow = useWindowStore((s) => s.focusWindow)
  const closeWindow = useWindowStore((s) => s.closeWindow)
  const moveWindow = useWindowStore((s) => s.moveWindow)
  const resizeWindow = useWindowStore((s) => s.resizeWindow)
  const setState = useWindowStore((s) => s.setWindowState)

  const dragRef = useRef<{ dx: number; dy: number; pointerId: number } | null>(null)
  const resizeRef = useRef<{
    edge: ResizeEdge
    startX: number
    startY: number
    startW: number
    startH: number
    pointerId: number
  } | null>(null)
  const [, force] = useState(0)

  if (!w) return null
  const manifest = byId[w.appId]
  if (!manifest) return null
  const Comp = manifest.component

  function onPointerDown(e: RP<HTMLDivElement>) {
    if (!w) return
    focusWindow(w.id)
    dragRef.current = {
      dx: e.clientX - w.position.x,
      dy: e.clientY - w.position.y,
      pointerId: e.pointerId,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: RP<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || !w) return
    if (e.pointerId !== drag.pointerId) return
    moveWindow(w.id, { x: e.clientX - drag.dx, y: e.clientY - drag.dy })
  }
  function onPointerUp(e: RP<HTMLDivElement>) {
    const drag = dragRef.current
    if (drag && e.pointerId !== drag.pointerId) return
    dragRef.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    force((n) => n + 1)
  }

  function startResize(edge: ResizeEdge) {
    return (e: RP<HTMLDivElement>) => {
      if (!w) return
      e.stopPropagation()
      focusWindow(w.id)
      resizeRef.current = {
        edge,
        startX: e.clientX,
        startY: e.clientY,
        startW: w.size.w,
        startH: w.size.h,
        pointerId: e.pointerId,
      }
      e.currentTarget.setPointerCapture(e.pointerId)
    }
  }
  function onResizeMove(e: RP<HTMLDivElement>) {
    const r = resizeRef.current
    if (!r || !w) return
    if (e.pointerId !== r.pointerId) return
    const min = manifest.minSize
    let nextW = r.startW
    let nextH = r.startH
    if (r.edge === 'right' || r.edge === 'corner') {
      nextW = Math.max(min.w, r.startW + (e.clientX - r.startX))
    }
    if (r.edge === 'bottom' || r.edge === 'corner') {
      nextH = Math.max(min.h, r.startH + (e.clientY - r.startY))
    }
    resizeWindow(w.id, { w: nextW, h: nextH })
  }
  function onResizeUp(e: RP<HTMLDivElement>) {
    const r = resizeRef.current
    if (r && e.pointerId !== r.pointerId) return
    resizeRef.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  const isMinimized = w.state === 'min'
  const isFixed = w.state === 'fullscreen' || w.state === 'max'
  const baseStyle: React.CSSProperties = isFixed
    ? { top: 28, left: 0, right: 0, bottom: 0, position: 'absolute', zIndex: w.z }
    : {
        position: 'absolute',
        left: w.position.x,
        top: w.position.y,
        width: w.size.w,
        height: w.size.h,
        zIndex: w.z,
      }
  // Keep minimized windows mounted so app state (terminal history, scroll, etc.) is preserved.
  const style: React.CSSProperties = isMinimized ? { ...baseStyle, display: 'none' } : baseStyle

  const showResize = !isFixed

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
        onPointerCancel={onPointerUp}
        onDoubleClick={() => setState(w.id, w.state === 'max' ? 'normal' : 'max')}
      >
        <span className="group flex gap-2 items-center px-1 py-1">
          <button
            type="button"
            aria-label="Close"
            className="w-3 h-3 rounded-full bg-zinc-600 group-hover:bg-[#ff5f57] cursor-pointer flex items-center justify-center leading-none font-bold transition-colors"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              closeWindow(w.id)
            }}
          >
            <span
              aria-hidden="true"
              className="opacity-0 hover:opacity-100 text-[10px] text-[#4d0000]"
              style={{ lineHeight: 0 }}
            >
              ×
            </span>
          </button>
          <button
            type="button"
            aria-label="Minimize"
            className="w-3 h-3 rounded-full bg-zinc-600 group-hover:bg-[#febc2e] cursor-pointer flex items-center justify-center leading-none font-bold transition-colors"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              setState(w.id, 'min')
            }}
          >
            <span
              aria-hidden="true"
              className="opacity-0 hover:opacity-100 text-[12px] text-[#5a3a00]"
              style={{ lineHeight: 0, marginTop: -1 }}
            >
              −
            </span>
          </button>
          <button
            type="button"
            aria-label="Maximize"
            className="w-3 h-3 rounded-full bg-zinc-600 group-hover:bg-[#28c840] cursor-pointer flex items-center justify-center leading-none font-bold transition-colors"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              setState(w.id, w.state === 'max' ? 'normal' : 'max')
            }}
          >
            <span
              aria-hidden="true"
              className="opacity-0 hover:opacity-100 text-[10px] text-[#003300]"
              style={{ lineHeight: 0 }}
            >
              +
            </span>
          </button>
        </span>
        <span className="mx-auto -translate-x-4 text-xs opacity-70">{manifest.title}</span>
      </div>
      <div
        className="h-[calc(100%-1.75rem)] overflow-auto"
        style={{ background: 'rgba(40,40,46,0.78)' }}
      >
        <Comp windowId={w.id} params={w.params} />
      </div>
      {showResize && (
        <>
          {/* Right edge */}
          <div
            title="Resize right"
            className="absolute top-2 right-0 bottom-3 w-1.5 cursor-ew-resize hover:bg-white/10"
            onPointerDown={startResize('right')}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeUp}
            onPointerCancel={onResizeUp}
          />
          {/* Bottom edge */}
          <div
            title="Resize bottom"
            className="absolute left-2 right-3 bottom-0 h-1.5 cursor-ns-resize hover:bg-white/10"
            onPointerDown={startResize('bottom')}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeUp}
            onPointerCancel={onResizeUp}
          />
          {/* Bottom-right corner */}
          <div
            title="Resize corner"
            className="absolute right-0 bottom-0 w-3 h-3 cursor-nwse-resize hover:bg-white/15"
            onPointerDown={startResize('corner')}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeUp}
            onPointerCancel={onResizeUp}
          />
        </>
      )}
    </div>
  )
}
