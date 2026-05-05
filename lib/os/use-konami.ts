'use client'
import { useEffect } from 'react'

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
] as const

export function useKonami(onMatch: () => void) {
  useEffect(() => {
    let buf: string[] = []
    function onKey(e: KeyboardEvent) {
      buf = [...buf, e.key].slice(-KONAMI.length)
      if (buf.length === KONAMI.length && buf.every((k, i) => k === KONAMI[i])) {
        buf = []
        onMatch()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onMatch])
}
