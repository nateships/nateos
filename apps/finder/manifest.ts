import type { AppManifest } from '@/lib/os/types'
import { FinderApp } from './app'
import { FinderIcon } from './icon'

export const manifest: AppManifest = {
  id: 'finder',
  title: 'Finder',
  icon: FinderIcon,
  route: '/finder',
  component: FinderApp,
  defaultSize: { w: 880, h: 560 },
  minSize: { w: 420, h: 320 },
  capabilities: ['resize', 'minimize'],
  surfaces: ['dock', 'launchpad', 'spotlight'],
  category: 'core',
  description: 'Browse the NateOS virtual filesystem of projects, notes, and documents.',
}
