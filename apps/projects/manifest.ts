import type { AppManifest } from '@/lib/os/types'
import { ProjectsApp } from './app'
import { ProjectsIcon } from './icon'

export const manifest: AppManifest = {
  id: 'projects',
  title: 'Projects',
  icon: ProjectsIcon,
  route: '/projects',
  component: ProjectsApp,
  defaultSize: { w: 960, h: 620 },
  minSize: { w: 420, h: 320 },
  capabilities: ['resize', 'minimize'],
  surfaces: ['dock', 'launchpad', 'spotlight'],
  category: 'core',
}
