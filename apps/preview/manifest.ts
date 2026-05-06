import type { AppManifest } from '@/lib/os/types'
import { PreviewApp } from './app'
import { PreviewIcon } from './icon'

export const manifest: AppManifest = {
  id: 'preview',
  title: 'Preview',
  icon: PreviewIcon,
  route: '/preview',
  component: PreviewApp,
  defaultSize: { w: 1040, h: 920 },
  minSize: { w: 480, h: 400 },
  capabilities: ['resize', 'multi-instance'],
  surfaces: [],
  category: 'core',
  description: 'Quick Look — preview PDFs and documents inline.',
}
