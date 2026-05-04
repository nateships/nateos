import type { AppManifest } from '@/lib/os/types'
import { SettingsApp } from './app'
import { SettingsIcon } from './icon'

export const manifest: AppManifest = {
  id: 'settings',
  title: 'Settings',
  icon: SettingsIcon,
  route: '/settings',
  component: SettingsApp,
  defaultSize: { w: 720, h: 500 },
  minSize: { w: 420, h: 320 },
  capabilities: ['resize', 'minimize'],
  surfaces: ['dock', 'launchpad', 'spotlight'],
  category: 'core',
  description: 'System preferences: appearance, wallpaper, era toggle (Tahoe / Classic).',
}
