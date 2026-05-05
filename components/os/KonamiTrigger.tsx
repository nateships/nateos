'use client'
import { useState } from 'react'
import { useKonami } from '@/lib/os/use-konami'
import { AboutDialog } from './menubar/AboutDialog'

export function KonamiTrigger() {
  const [open, setOpen] = useState(false)
  useKonami(() => setOpen(true))
  return <AboutDialog open={open} onClose={() => setOpen(false)} />
}
