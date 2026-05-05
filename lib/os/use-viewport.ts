'use client'
import { useEffect, useState } from 'react'

const MOBILE_MAX = 767

export type Viewport = {
  isMobile: boolean
  width: number
}

function read(): Viewport {
  if (typeof window === 'undefined') return { isMobile: false, width: 1280 }
  return { isMobile: window.innerWidth <= MOBILE_MAX, width: window.innerWidth }
}

export function useViewport(): Viewport {
  const [vp, setVp] = useState<Viewport>(read)
  useEffect(() => {
    function onResize() {
      setVp(read())
    }
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return vp
}
