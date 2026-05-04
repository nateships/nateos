import type { AppManifest } from '@/lib/os/types'
import { CalculatorApp } from './app'
import { CalculatorIcon } from './icon'

export const manifest: AppManifest = {
  id: 'calculator',
  title: 'Calculator',
  icon: CalculatorIcon,
  route: '/calculator',
  component: CalculatorApp,
  defaultSize: { w: 320, h: 500 },
  minSize: { w: 280, h: 400 },
  capabilities: ['resize', 'minimize'],
  surfaces: ['dock', 'launchpad', 'spotlight'],
  category: 'core',
}
