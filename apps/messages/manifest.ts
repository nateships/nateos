import type { AppManifest } from '@/lib/os/types'
import { MessagesApp } from './app'
import { MessagesIcon } from './icon'

export const manifest: AppManifest = {
  id: 'messages',
  title: 'Messages',
  icon: MessagesIcon,
  route: '/messages',
  component: MessagesApp,
  defaultSize: { w: 600, h: 500 },
  minSize: { w: 420, h: 320 },
  capabilities: ['resize', 'minimize'],
  surfaces: ['dock', 'launchpad', 'spotlight'],
  category: 'core',
}
