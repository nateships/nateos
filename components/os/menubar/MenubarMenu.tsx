'use client'
import { type ReactNode, useEffect, useId, useRef } from 'react'

type Align = 'start' | 'end'

type Props = {
  /** Trigger label or content. */
  trigger: ReactNode
  /** Open state controlled by parent so only one menu opens at a time. */
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Panel alignment relative to the trigger. */
  align?: Align
  /** Optional explicit panel width. */
  panelClassName?: string
  /** Panel content. */
  children: ReactNode
  /** Optional aria label for the trigger button. */
  ariaLabel?: string
  /** Extra classes for the trigger button. */
  triggerClassName?: string
  /** Called when the trigger is hovered. Used by parent to implement
   *  macOS-style "menu follows mouse" once any menu is already open. */
  onTriggerEnter?: () => void
}

/**
 * Generic macOS-style menubar dropdown.
 * - Click trigger to toggle.
 * - Click outside or press Escape to close.
 * - Panel renders below the menubar (top: 28px) aligned to trigger edge.
 */
export function MenubarMenu({
  trigger,
  open,
  onOpenChange,
  align = 'start',
  panelClassName,
  children,
  ariaLabel,
  triggerClassName,
  onTriggerEnter,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelId = useId()

  // Click-outside close.
  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node | null
      if (!target) return
      if (rootRef.current?.contains(target)) return
      onOpenChange(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [open, onOpenChange])

  // Escape close.
  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onOpenChange(false)
        triggerRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  return (
    <div ref={rootRef} className="relative inline-flex h-7 items-stretch">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={ariaLabel}
        onClick={() => onOpenChange(!open)}
        onMouseEnter={() => onTriggerEnter?.()}
        className={[
          'inline-flex items-center h-7 px-2 rounded-sm transition-colors focus:outline-none',
          'hover:bg-white/10',
          open ? 'bg-white/25' : '',
          triggerClassName ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {trigger}
      </button>
      {open ? (
        <div
          id={panelId}
          role="menu"
          className={[
            'absolute top-7 z-[60] min-w-[200px] py-1.5 rounded-lg border border-white/10 shadow-2xl text-white text-[12px]',
            'backdrop-blur-xl bg-zinc-900/85',
            align === 'end' ? 'right-0' : 'left-0',
            panelClassName ?? '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

type ItemProps = {
  children: ReactNode
  onSelect?: () => void
  disabled?: boolean
  /** Show right-aligned shortcut hint. */
  shortcut?: string
}

/** Menu row: 28px height, hover highlights blue, full-width inside the panel. */
export function MenubarMenuItem({ children, onSelect, disabled, shortcut }: ItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        if (disabled) return
        onSelect?.()
      }}
      className={[
        'w-full h-7 px-3 flex items-center justify-between gap-6 text-left rounded-sm transition-colors',
        disabled
          ? 'opacity-40 cursor-default'
          : 'hover:bg-blue-500/80 hover:text-white focus:bg-blue-500/80 focus:text-white focus:outline-none',
      ].join(' ')}
    >
      <span className="truncate">{children}</span>
      {shortcut ? <span className="opacity-70 text-[11px]">{shortcut}</span> : null}
    </button>
  )
}

/** Thin separator between groups. */
export function MenubarMenuSeparator() {
  return <div className="my-1 mx-2 h-px bg-white/10" aria-hidden="true" />
}
