import { manifest as calculator } from '@/apps/calculator/manifest'
import { manifest as calendar } from '@/apps/calendar/manifest'
import { manifest as finder } from '@/apps/finder/manifest'
import { manifest as messages } from '@/apps/messages/manifest'
import { manifest as profile } from '@/apps/profile/manifest'
import { manifest as projects } from '@/apps/projects/manifest'
import { manifest as resume } from '@/apps/resume/manifest'
import { manifest as safari } from '@/apps/safari/manifest'
import { manifest as settings } from '@/apps/settings/manifest'
import { manifest as terminal } from '@/apps/terminal/manifest'
import type { AppManifest } from './types'

export const registry: AppManifest[] = [
  profile,
  resume,
  projects,
  terminal,
  messages,
  safari,
  finder,
  settings,
  calendar,
  calculator,
]

export const byId: Record<string, AppManifest> = Object.fromEntries(registry.map((a) => [a.id, a]))

export const byRoute: Record<string, AppManifest> = Object.fromEntries(
  registry.map((a) => [a.route, a]),
)
