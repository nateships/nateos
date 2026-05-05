import type { ComponentType } from 'react'

export type Capability =
  | 'fullscreen'
  | 'resize'
  | 'minimize'
  | 'multi-instance'
  | 'persists-state'
  | 'requires-network'

export type Surface = 'dock' | 'launchpad' | 'spotlight' | 'menubar-only'

export type AppCategory = 'core' | 'utility' | 'media' | 'dev' | 'future'

export type AppParams = Record<string, string | number | boolean | undefined>

export interface AppContext {
  windowId: string
  params?: AppParams
}

export interface AppManifest {
  id: string
  title: string
  icon: ComponentType<{ size?: number }>
  route: string
  component: ComponentType<AppContext>
  defaultSize: { w: number; h: number }
  minSize: { w: number; h: number }
  capabilities: Capability[]
  surfaces: Surface[]
  category: AppCategory
  badge?: () => string | number | null
  schema?: Record<string, { type: 'string' | 'number' | 'boolean'; optional?: boolean }>
  disabled?: boolean
  /** Short copy shown in the App > About <Name> dialog. Plan 2 fills these in. */
  description?: string
}

export interface WindowState {
  id: string
  appId: string
  position: { x: number; y: number }
  size: { w: number; h: number }
  state: 'normal' | 'min' | 'max' | 'fullscreen'
  z: number
  params?: AppParams
}
