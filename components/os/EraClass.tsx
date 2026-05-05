'use client'
import { useEffect } from 'react'
import { useSettings } from '@/lib/settings/store'

/** Toggles `era-classic` / `era-tahoe` on <body> based on settings. */
export function EraClass() {
  const era = useSettings((s) => s.era)
  useEffect(() => {
    const cls = era === 'classic' ? 'era-classic' : 'era-tahoe'
    document.body.classList.remove('era-classic', 'era-tahoe')
    document.body.classList.add(cls)
    return () => {
      document.body.classList.remove(cls)
    }
  }, [era])
  return null
}
