import type { AppManifest } from '@/lib/os/types'
import { TerminalApp } from './app'
import { TerminalIcon } from './icon'

export const manifest: AppManifest = {
  id: 'terminal',
  title: 'Terminal',
  icon: TerminalIcon,
  route: '/terminal',
  component: TerminalApp,
  defaultSize: { w: 720, h: 440 },
  minSize: { w: 420, h: 320 },
  capabilities: ['multi-instance', 'resize', 'minimize'],
  surfaces: ['dock', 'launchpad', 'spotlight'],
  category: 'core',
  description: 'An interactive command-line tour of NateOS. Type help to begin.',
}
