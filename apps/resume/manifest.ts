import type { AppManifest } from '@/lib/os/types'
import { ResumeApp } from './app'
import { ResumeIcon } from './icon'

export const manifest: AppManifest = {
  id: 'resume',
  title: 'Resume',
  icon: ResumeIcon,
  route: '/resume',
  component: ResumeApp,
  defaultSize: { w: 900, h: 640 },
  minSize: { w: 420, h: 320 },
  capabilities: ['resize', 'minimize'],
  surfaces: ['dock', 'launchpad', 'spotlight'],
  category: 'core',
  description: 'Full work history, projects, certifications, and skills. PDF export available.',
}
