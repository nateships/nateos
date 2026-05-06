import type { ComponentType } from 'react'

export type Capability = 'resize' | 'minimize' | 'multi-instance'

export type Surface = 'dock' | 'launchpad' | 'spotlight'

export type AppCategory = 'core'

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
  disabled?: boolean
  /** Short copy shown in the App > About <Name> dialog. */
  description?: string
}

export type WindowMode = 'normal' | 'min' | 'max' | 'fullscreen'

export interface WindowState {
  id: string
  appId: string
  position: { x: number; y: number }
  size: { w: number; h: number }
  state: WindowMode
  z: number
  params?: AppParams
}
