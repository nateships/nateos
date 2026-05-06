import type { AppManifest } from '@/lib/os/types'
import { MessagesApp } from './app'
import { MessagesIcon } from './icon'

export const manifest: AppManifest = {
  id: 'messages',
  title: 'Messages',
  icon: MessagesIcon,
  route: '/messages',
  component: MessagesApp,
  defaultSize: { w: 520, h: 420 },
  minSize: { w: 420, h: 320 },
  capabilities: ['resize', 'minimize'],
  surfaces: ['dock', 'launchpad', 'spotlight'],
  category: 'core',
  description: 'Send Nate a message. Delivered via email; replies come from nate@nateofarrell.com.',
}
