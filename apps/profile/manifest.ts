import type { AppManifest } from '@/lib/os/types'
import { ProfileApp } from './app'
import { ProfileIcon } from './icon'

export const manifest: AppManifest = {
  id: 'profile',
  title: 'Profile',
  icon: ProfileIcon,
  route: '/profile',
  component: ProfileApp,
  defaultSize: { w: 720, h: 540 },
  minSize: { w: 420, h: 320 },
  capabilities: ['resize', 'minimize'],
  surfaces: ['dock', 'launchpad', 'spotlight'],
  category: 'core',
}
