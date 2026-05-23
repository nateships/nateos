'use client'
import { isJobSearchActive } from '@/lib/job-search'
import { DesktopIcons } from './DesktopIcons'
import { QrVCard } from './QrVCard'

export function DesktopWidgets() {
  return (
    <>
      <DesktopIcons />
      {isJobSearchActive() ? <QrVCard /> : null}
    </>
  )
}
