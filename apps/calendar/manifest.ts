import type { AppManifest } from '@/lib/os/types'
import { CalendarApp } from './app'
import { CalendarIcon } from './icon'

export const manifest: AppManifest = {
  id: 'calendar',
  title: 'Calendar',
  icon: CalendarIcon,
  route: '/calendar',
  component: CalendarApp,
  defaultSize: { w: 880, h: 780 },
  minSize: { w: 420, h: 320 },
  capabilities: ['resize', 'minimize'],
  surfaces: ['dock', 'launchpad', 'spotlight'],
  category: 'core',
  description: 'Public availability and a Book intro chat link via Cal.com.',
}
