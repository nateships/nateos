'use client'
import { useEffect, useState } from 'react'

export type BatteryStatus = {
  /** 0..1, or null if unknown. */
  level: number | null
  charging: boolean | null
  /** True if Battery Status API is supported and we got a reading. */
  supported: boolean
}

type BatteryManager = EventTarget & {
  level: number
  charging: boolean
  addEventListener: (type: string, listener: EventListener) => void
  removeEventListener: (type: string, listener: EventListener) => void
}

type NavigatorWithBattery = Navigator & {
  getBattery?: () => Promise<BatteryManager>
}

const FALLBACK: BatteryStatus = { level: null, charging: null, supported: false }

export function useBattery(): BatteryStatus {
  const [status, setStatus] = useState<BatteryStatus>(FALLBACK)

  useEffect(() => {
    let mounted = true
    let battery: BatteryManager | null = null

    function read() {
      if (!battery || !mounted) return
      setStatus({ level: battery.level, charging: battery.charging, supported: true })
    }

    const nav = navigator as NavigatorWithBattery
    if (typeof nav.getBattery !== 'function') return

    nav.getBattery().then((b) => {
      if (!mounted) return
      battery = b
      read()
      b.addEventListener('levelchange', read)
      b.addEventListener('chargingchange', read)
    })

    return () => {
      mounted = false
      if (battery) {
        battery.removeEventListener('levelchange', read)
        battery.removeEventListener('chargingchange', read)
      }
    }
  }, [])

  return status
}

export type NetworkStatus = {
  online: boolean
  /** 'wifi' | 'cellular' | 'ethernet' | 'none' | 'unknown' */
  type: string
  /** Effective downlink class: 'slow-2g' | '2g' | '3g' | '4g' | null */
  effectiveType: string | null
}

type NetworkInformation = EventTarget & {
  type?: string
  effectiveType?: string
}

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation
}

export function useNetwork(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => ({
    online: typeof navigator === 'undefined' ? true : navigator.onLine,
    type: 'unknown',
    effectiveType: null,
  }))

  useEffect(() => {
    function read() {
      const nav = navigator as NavigatorWithConnection
      const conn = nav.connection
      setStatus({
        online: navigator.onLine,
        type: conn?.type ?? 'unknown',
        effectiveType: conn?.effectiveType ?? null,
      })
    }
    read()
    window.addEventListener('online', read)
    window.addEventListener('offline', read)
    const conn = (navigator as NavigatorWithConnection).connection
    if (conn) conn.addEventListener('change', read)
    return () => {
      window.removeEventListener('online', read)
      window.removeEventListener('offline', read)
      if (conn) conn.removeEventListener('change', read)
    }
  }, [])

  return status
}
