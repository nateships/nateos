import type { AppManifest } from '@/lib/os/types'
import { SafariApp } from './app'
import { SafariIcon } from './icon'

export const manifest: AppManifest = {
  id: 'safari',
  title: 'Safari',
  icon: SafariIcon,
  route: '/safari',
  component: SafariApp,
  defaultSize: { w: 1000, h: 680 },
  minSize: { w: 420, h: 320 },
  capabilities: ['resize', 'minimize'],
  surfaces: ['dock', 'launchpad', 'spotlight'],
  category: 'core',
  description: 'Browse Nate links: GitHub, LinkedIn, blog, and more.',
}
