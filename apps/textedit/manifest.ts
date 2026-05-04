import type { AppManifest } from '@/lib/os/types'
import { TexteditApp } from './app'
import { TexteditIcon } from './icon'

export const manifest: AppManifest = {
  id: 'textedit',
  title: 'TextEdit',
  icon: TexteditIcon,
  route: '/textedit',
  component: TexteditApp,
  defaultSize: { w: 720, h: 560 },
  minSize: { w: 420, h: 320 },
  capabilities: ['multi-instance', 'resize', 'minimize'],
  surfaces: ['dock', 'launchpad', 'spotlight'],
  category: 'core',
  description: 'A plain markdown viewer. Open files from Finder or via deeplink.',
}
