'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { appIdFromPath, paramsFromPath } from '@/lib/os/deeplink'
import { byId } from '@/lib/os/registry'
import { useWindowStore } from '@/lib/os/window-store'

export function DeeplinkRouter() {
  const pathname = usePathname()
  const search = useSearchParams()
  const openApp = useWindowStore((s) => s.openApp)

  useEffect(() => {
    if (pathname === '/' || pathname === '') return
    const appId = appIdFromPath(pathname)
    if (!appId || !byId[appId]) return
    openApp(appId, paramsFromPath(pathname))
  }, [pathname, openApp])

  useEffect(() => {
    const open = search.get('open')
    if (!open) return
    for (const id of open
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)) {
      if (byId[id]) openApp(id)
    }
  }, [search, openApp])

  return null
}
