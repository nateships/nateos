# NateOS — Plan 3: Mobile + Retro + Easter Eggs + Deploy

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the final polish layer of NateOS: usable on phones via a bottom-tab single-window mode, a System 7-style "Classic" retro skin toggleable from Settings/Terminal, three discoverable easter eggs (Konami → About This Mac, Cmd+Opt+Esc force-quit dialog, `sudo hire-me` Terminal command), then deploy to Vercel and cut over `nate.cx` DNS.

**Architecture:** A `useViewport()` hook drives a hard split at 768px between `<DesktopShell>` (existing) and a new `<MobileShell>` that ignores the window manager and renders one app at a time inside `<MobileTabBar>`. Era theming lives in the existing Zustand `useSettings` store + an `era` body class — Tahoe (default) keeps current chrome; Classic adds B&W titlebars, square-cornered windows, Chicago/Charcoal fonts, and a 1984 boot screen. Easter eggs hook the existing Konami detector pattern (already in Calculator) into a global listener; force-quit overlay reuses the existing modal pattern.

**Tech Stack:** Next.js 16.2.4 · React 19 · Bun · Tailwind v4 · Zustand · existing OS shell + registry. No new runtime deps.

**Branch:** continue on `feature/foundation`.

---

## Out-of-scope (intentional)

- Per-app retro reskinning of app interiors (Settings, Resume, Projects content, etc.). Retro = chrome + boot + fonts, per spec §7.3. App body content stays modern in both eras.
- iOS-style springboard mobile experience. Plan 4+ if ever wanted.
- Real wallpaper picker for retro era (single B&W desktop pattern only).
- Sentry / observability — still parked.

---

## File Structure (created/modified)

```
portfolio/
  lib/
    os/
      use-viewport.ts            # NEW — breakpoint hook
      use-konami.ts              # NEW — global Konami detector
    settings/
      store.ts                   # MODIFIED — add era: 'tahoe' | 'classic'
  components/
    mobile/
      MobileShell.tsx            # NEW
      MobileTabBar.tsx           # NEW
    os/
      DesktopShell.tsx           # MODIFIED — viewport switch
      Wallpaper.tsx              # MODIFIED — era-aware (classic = pattern)
      Menubar.tsx                # MODIFIED — era-aware classes
      Window.tsx                 # MODIFIED — era-aware classes
      BootScreen.tsx             # MODIFIED — era variant
      ForceQuit.tsx              # NEW — Cmd+Opt+Esc dialog
      KonamiTrigger.tsx          # NEW — listens, opens AboutDialog
  apps/
    settings/
      AppearancePane.tsx         # MODIFIED — add Era picker
    terminal/
      commands.ts                # MODIFIED — theme + sudo hire-me
      commands.test.ts           # MODIFIED — new tests
  app/
    globals.css                  # MODIFIED — era CSS variables + retro classes
    HomeClient.tsx               # MODIFIED — retro boot variant + ForceQuit + KonamiTrigger
  docs/
    DEPLOY.md                    # NEW — Vercel + DNS checklist
```

---

### Task 1: Viewport hook

**Files:**
- Create: `lib/os/use-viewport.ts`, `lib/os/use-viewport.test.ts`

- [ ] **Step 1: Failing test**

`lib/os/use-viewport.test.ts`:
```ts
import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useViewport } from './use-viewport'

describe('useViewport', () => {
  let originalInnerWidth: number
  beforeEach(() => {
    originalInnerWidth = window.innerWidth
  })
  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true })
  })

  it('returns isMobile=true when innerWidth < 768', () => {
    Object.defineProperty(window, 'innerWidth', { value: 480, configurable: true })
    const { result } = renderHook(() => useViewport())
    expect(result.current.isMobile).toBe(true)
  })

  it('returns isMobile=false when innerWidth >= 768', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true })
    const { result } = renderHook(() => useViewport())
    expect(result.current.isMobile).toBe(false)
  })
})
```

- [ ] **Step 2: Install RTL deps + jsdom**

```bash
bun add -D @testing-library/react @testing-library/dom jsdom
```

Add `apps/**/*.test.tsx` to vitest include if not already there. Read `vitest.config.ts` and update:
- `environment` → `jsdom`
- `include` → add `'lib/**/*.test.tsx'`

If the existing config doesn't use jsdom (it uses `node`), keep `node` for non-DOM tests but add an override block. Simplest path: switch the whole config to `jsdom` — Vitest with jsdom still runs Node-style tests fine.

Updated `vitest.config.ts`:
```ts
import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['lib/**/*.test.{ts,tsx}', 'apps/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

- [ ] **Step 3: Run, expect FAIL**

```bash
bun run test lib/os/use-viewport.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 4: Implement hook**

`lib/os/use-viewport.ts`:
```ts
'use client'
import { useEffect, useState } from 'react'

const MOBILE_MAX = 767

export type Viewport = {
  isMobile: boolean
  width: number
}

function read(): Viewport {
  if (typeof window === 'undefined') return { isMobile: false, width: 1280 }
  return { isMobile: window.innerWidth <= MOBILE_MAX, width: window.innerWidth }
}

export function useViewport(): Viewport {
  const [vp, setVp] = useState<Viewport>(read)
  useEffect(() => {
    function onResize() {
      setVp(read())
    }
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return vp
}
```

- [ ] **Step 5: Tests pass**

```bash
bun run test lib/os/use-viewport.test.ts
```
Expected: 2/2 PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/os/use-viewport.ts lib/os/use-viewport.test.ts vitest.config.ts package.json bun.lock
git commit -m "feat(os): useViewport hook + jsdom test env for DOM hooks"
```

---

### Task 2: MobileTabBar component

**Files:**
- Create: `components/mobile/MobileTabBar.tsx`

- [ ] **Step 1: Component**

`components/mobile/MobileTabBar.tsx`:
```tsx
'use client'
import type { ComponentType } from 'react'

export type TabId = 'resume' | 'projects' | 'messages' | 'safari' | 'terminal'

export type Tab = {
  id: TabId
  label: string
  Icon: ComponentType<{ size?: number }>
}

type Props = {
  tabs: Tab[]
  active: TabId
  onSelect: (id: TabId) => void
}

export function MobileTabBar({ tabs, active, onSelect }: Props) {
  return (
    <nav
      aria-label="App tabs"
      className="fixed bottom-0 inset-x-0 z-50 flex items-stretch h-16 border-t border-white/10"
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(20,20,24,0.85)',
      }}
    >
      {tabs.map((t) => {
        const isActive = t.id === active
        return (
          <button
            key={t.id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onSelect(t.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 ${
              isActive ? 'text-blue-400' : 'text-white/60'
            }`}
          >
            <t.Icon size={22} />
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
bun run typecheck
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/mobile/MobileTabBar.tsx
git commit -m "feat(mobile): MobileTabBar component"
```

---

### Task 3: MobileShell

**Files:**
- Create: `components/mobile/MobileShell.tsx`

- [ ] **Step 1: Component**

`components/mobile/MobileShell.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { byId } from '@/lib/os/registry'
import { MobileTabBar, type Tab, type TabId } from './MobileTabBar'

const TAB_IDS: TabId[] = ['resume', 'projects', 'messages', 'safari', 'terminal']

const TAB_LABELS: Record<TabId, string> = {
  resume: 'Resume',
  projects: 'Projects',
  messages: 'Contact',
  safari: 'Links',
  terminal: 'Terminal',
}

function tabFromPath(pathname: string): TabId | null {
  const seg = pathname.split('/').filter(Boolean)[0]
  if (!seg) return null
  return TAB_IDS.includes(seg as TabId) ? (seg as TabId) : null
}

export function MobileShell() {
  const pathname = usePathname()
  const [active, setActive] = useState<TabId>(() => tabFromPath(pathname) ?? 'resume')

  // Auto-select tab on deeplink change.
  useEffect(() => {
    const t = tabFromPath(pathname)
    if (t) setActive(t)
  }, [pathname])

  const tabs: Tab[] = TAB_IDS.map((id) => {
    const m = byId[id]
    return {
      id,
      label: TAB_LABELS[id],
      Icon: m?.icon ?? (() => null),
    }
  })

  const activeApp = byId[active]
  const ActiveComponent = activeApp?.component

  return (
    <div className="fixed inset-0 flex flex-col bg-zinc-900 text-white">
      <header className="flex items-center justify-center h-10 border-b border-white/10 bg-zinc-900/95">
        <span className="text-[13px] font-semibold tracking-tight">{TAB_LABELS[active]}</span>
      </header>
      <main className="flex-1 overflow-hidden pb-16">
        {ActiveComponent ? <ActiveComponent windowId={`mobile-${active}`} /> : null}
      </main>
      <MobileTabBar tabs={tabs} active={active} onSelect={setActive} />
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
bun run typecheck
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/mobile/MobileShell.tsx
git commit -m "feat(mobile): MobileShell — single-window full-screen tab host"
```

---

### Task 4: DesktopShell viewport switch

**Files:**
- Modify: `components/os/DesktopShell.tsx`

- [ ] **Step 1: Modify**

Read `components/os/DesktopShell.tsx`. Replace its body to switch to `MobileShell` on mobile:

```tsx
'use client'
import { Suspense } from 'react'
import { DeeplinkRouter } from '@/components/deeplink/DeeplinkRouter'
import { DesktopWidgets } from '@/components/desktop/DesktopWidgets'
import { MobileShell } from '@/components/mobile/MobileShell'
import { useViewport } from '@/lib/os/use-viewport'
import { Dock } from './Dock'
import { Menubar } from './Menubar'
import { Wallpaper } from './Wallpaper'
import { WindowLayer } from './WindowLayer'

export function DesktopShell({ children }: { children: React.ReactNode }) {
  const { isMobile } = useViewport()

  if (isMobile) {
    return <MobileShell />
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Wallpaper />
      <Menubar />
      <DesktopWidgets />
      <WindowLayer />
      <Dock />
      <Suspense fallback={null}>
        <DeeplinkRouter />
      </Suspense>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Build + smoke**

```bash
bun run typecheck
bun run lint
bun run build
```

All clean.

Optional manual smoke: `bun run dev`, resize browser narrower than 768px → mobile layout appears; widen → desktop returns. Click each tab → app renders full-screen. Visit `/resume` mobile → Resume tab active.

- [ ] **Step 3: Commit**

```bash
git add components/os/DesktopShell.tsx
git commit -m "feat(mobile): viewport switch (<768px) — DesktopShell ↔ MobileShell"
```

---

### Task 5: Settings store — era field

**Files:**
- Modify: `lib/settings/store.ts`

- [ ] **Step 1: Modify**

Read `lib/settings/store.ts`. Add `era` and setter:

```ts
'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppearanceMode = 'light' | 'dark' | 'auto'
export type Era = 'tahoe' | 'classic'

type SettingsState = {
  appearance: AppearanceMode
  wallpaper: string
  reduceMotion: boolean
  era: Era
  setAppearance(mode: AppearanceMode): void
  setWallpaper(path: string): void
  setReduceMotion(v: boolean): void
  setEra(era: Era): void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      appearance: 'dark',
      wallpaper: '/apple/wallpapers/nateos-big-sur-dark.jpg',
      reduceMotion: false,
      era: 'tahoe',
      setAppearance: (mode) => set({ appearance: mode }),
      setWallpaper: (path) => set({ wallpaper: path }),
      setReduceMotion: (v) => set({ reduceMotion: v }),
      setEra: (era) => set({ era }),
    }),
    { name: 'nateos.settings' },
  ),
)
```

- [ ] **Step 2: Typecheck**

```bash
bun run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add lib/settings/store.ts
git commit -m "feat(settings): add era ('tahoe' | 'classic') to settings store"
```

---

### Task 6: Era CSS + body class binding

**Files:**
- Modify: `app/globals.css`, `app/layout.tsx`, `app/HomeClient.tsx`
- Create: `components/os/EraClass.tsx`

- [ ] **Step 1: Append era styles to globals.css**

Append to `app/globals.css`:
```css
/* Era theming. .era-classic body class triggers retro chrome. */
.era-classic {
  --color-classic-bg: #c0c0c0;
  --color-classic-fg: #000000;
  --color-classic-titlebar: #ffffff;
  --color-classic-stripe: #000000;
  --classic-radius: 0px;
  --classic-font-ui: 'Chicago', 'ChicagoFLF', 'Charcoal', system-ui, sans-serif;
}

.era-classic .nateos-window {
  border-radius: var(--classic-radius) !important;
  border: 1px solid #000 !important;
  background: var(--color-classic-bg) !important;
  color: var(--color-classic-fg) !important;
  box-shadow: 2px 2px 0 0 #000 !important;
  font-family: var(--classic-font-ui);
}

.era-classic .nateos-window-titlebar {
  background:
    repeating-linear-gradient(
      to bottom,
      var(--color-classic-stripe) 0,
      var(--color-classic-stripe) 1px,
      var(--color-classic-titlebar) 1px,
      var(--color-classic-titlebar) 3px
    ) !important;
  color: var(--color-classic-fg) !important;
  border-bottom: 1px solid #000 !important;
}

.era-classic .nateos-window-title {
  background: var(--color-classic-titlebar);
  padding: 0 8px;
  border: 1px solid #000;
  border-top: none;
  border-bottom: none;
  font-family: var(--classic-font-ui);
  font-weight: 700;
}

.era-classic .nateos-menubar {
  background: #ffffff !important;
  color: #000 !important;
  border-bottom: 1px solid #000 !important;
  font-family: var(--classic-font-ui);
}

.era-classic .nateos-dock {
  background: #ffffff !important;
  border: 1px solid #000 !important;
  border-radius: 0 !important;
}

.era-classic .nateos-wallpaper {
  background:
    repeating-conic-gradient(
      #5a5a5a 0% 25%,
      #6a6a6a 25% 50%
    ) 0 0 / 6px 6px !important;
}

.era-classic .nateos-traffic-light {
  border-radius: 0 !important;
  width: 14px !important;
  height: 14px !important;
  background: #fff !important;
  border: 1px solid #000 !important;
}
```

(Don't worry about Chicago font being installed; it falls back to Charcoal/system. Real-Mac users may have the font; others see the bold system fallback. Spec accepts era as discoverable easter egg, not pixel-perfect.)

- [ ] **Step 2: EraClass component**

`components/os/EraClass.tsx`:
```tsx
'use client'
import { useEffect } from 'react'
import { useSettings } from '@/lib/settings/store'

/** Toggles `era-classic` / `era-tahoe` on <body> based on settings. */
export function EraClass() {
  const era = useSettings((s) => s.era)
  useEffect(() => {
    const cls = era === 'classic' ? 'era-classic' : 'era-tahoe'
    document.body.classList.remove('era-classic', 'era-tahoe')
    document.body.classList.add(cls)
    return () => {
      document.body.classList.remove(cls)
    }
  }, [era])
  return null
}
```

- [ ] **Step 3: Mount EraClass in HomeClient**

Read `app/HomeClient.tsx`. Add `<EraClass />` above the boot/desktop logic so the body class binds on mount.

```tsx
'use client'
import { useEffect, useState } from 'react'
import { BootScreen } from '@/components/os/BootScreen'
import { EraClass } from '@/components/os/EraClass'
import { useWindowStore } from '@/lib/os/window-store'

const KEY = 'nateos_booted'

export function HomeClient() {
  const [booting, setBooting] = useState<boolean>(false)
  const openApp = useWindowStore((s) => s.openApp)
  const windows = useWindowStore((s) => s.windows)

  useEffect(() => {
    const already = sessionStorage.getItem(KEY) === '1'
    if (already) {
      ensureTerminal()
    } else {
      setBooting(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function ensureTerminal() {
    if (!windows.find((w) => w.appId === 'terminal')) {
      openApp('terminal')
    }
  }

  function onBootDone() {
    sessionStorage.setItem(KEY, '1')
    setBooting(false)
    ensureTerminal()
  }

  return (
    <>
      <EraClass />
      {booting ? <BootScreen onDone={onBootDone} /> : null}
    </>
  )
}
```

- [ ] **Step 4: Tag window/menubar/dock for era CSS**

Add the marker classes the CSS targets. Read the existing files; add the listed classes alongside existing classNames.

In `components/os/Window.tsx`:
- Outer window div: append `nateos-window`
- Titlebar div: append `nateos-window-titlebar`
- Title text span: append `nateos-window-title`
- Each traffic-light button: append `nateos-traffic-light`

In `components/os/Menubar.tsx` outer div: append `nateos-menubar`.

In `components/os/Dock.tsx` outer div: append `nateos-dock`.

In `components/os/Wallpaper.tsx` outer div: append `nateos-wallpaper`.

For each, simply add the class string to the existing className. Example, `Window.tsx`:
```diff
- className="rounded-xl overflow-hidden border border-white/10 shadow-2xl text-white/90"
+ className="nateos-window rounded-xl overflow-hidden border border-white/10 shadow-2xl text-white/90"
```

The era-specific CSS overrides via `!important` flatten the Tahoe styling when classic is active.

- [ ] **Step 5: Build + verify**

```bash
bun run typecheck
bun run lint
bun run build
```

All clean.

Manual smoke: in dev tools, run `localStorage.setItem('nateos.settings', JSON.stringify({state:{era:'classic',appearance:'dark',wallpaper:'/apple/wallpapers/nateos-big-sur-dark.jpg',reduceMotion:false},version:0}))` and reload. Should see B&W chrome.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css app/HomeClient.tsx components/os/EraClass.tsx components/os/Window.tsx components/os/Menubar.tsx components/os/Dock.tsx components/os/Wallpaper.tsx
git commit -m "feat(retro): era CSS layer + body class binding (Classic vs Tahoe)"
```

---

### Task 7: Era picker in Settings + Terminal `theme` command

**Files:**
- Modify: `apps/settings/AppearancePane.tsx`, `apps/terminal/commands.ts`, `apps/terminal/commands.test.ts`

- [ ] **Step 1: Update AppearancePane**

Read `apps/settings/AppearancePane.tsx`. Add Era section above the existing Appearance toggle:

```tsx
'use client'
import { type AppearanceMode, type Era, useSettings } from '@/lib/settings/store'

const MODES: { value: AppearanceMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'auto', label: 'Auto' },
]

const ERAS: { value: Era; label: string; sub: string }[] = [
  { value: 'tahoe', label: 'Tahoe', sub: 'Modern macOS' },
  { value: 'classic', label: 'Classic', sub: 'System 7-ish' },
]

export function AppearancePane() {
  const mode = useSettings((s) => s.appearance)
  const setMode = useSettings((s) => s.setAppearance)
  const era = useSettings((s) => s.era)
  const setEra = useSettings((s) => s.setEra)
  const reduceMotion = useSettings((s) => s.reduceMotion)
  const setReduceMotion = useSettings((s) => s.setReduceMotion)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[12px] font-semibold mb-2">Era</h3>
        <div className="flex gap-2">
          {ERAS.map((e) => (
            <button
              key={e.value}
              type="button"
              onClick={() => setEra(e.value)}
              className={`px-3 py-1.5 rounded-md text-[12px] flex flex-col items-start ${
                era === e.value ? 'bg-blue-500 text-white' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="font-medium">{e.label}</span>
              <span className="text-[10px] opacity-70">{e.sub}</span>
            </button>
          ))}
        </div>
        <p className="text-[11px] opacity-50 mt-2">Classic swaps the boot screen + window chrome.</p>
      </div>
      <div>
        <h3 className="text-[12px] font-semibold mb-2">Appearance</h3>
        <div className="flex gap-2">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={`px-3 py-1.5 rounded-md text-[12px] ${
                mode === m.value ? 'bg-blue-500 text-white' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] opacity-50 mt-2">Light/dark currently visual-only; era is the real switch.</p>
      </div>
      <label className="flex items-center gap-3 text-[12px]">
        <input
          type="checkbox"
          checked={reduceMotion}
          onChange={(e) => setReduceMotion(e.target.checked)}
        />
        Reduce motion (skip boot animation)
      </label>
    </div>
  )
}
```

- [ ] **Step 2: Update Terminal `theme` command**

Read `apps/terminal/commands.ts`. The existing `theme` command currently just echoes a message. Replace its handler to actually toggle the store:

Add at the top of the file (after existing imports):
```ts
import { useSettings } from '@/lib/settings/store'
```

Replace the existing `case 'theme': { ... }` block with:
```ts
    case 'theme': {
      const arg = args[0]
      if (!arg || !['classic', 'tahoe'].includes(arg)) {
        return 'usage: theme <classic|tahoe>'
      }
      useSettings.getState().setEra(arg as 'classic' | 'tahoe')
      return `theme set to ${arg}.`
    }
```

- [ ] **Step 3: Update tests**

Read `apps/terminal/commands.test.ts`. Add at the end of `describe('terminal commands', ...)`:

```ts
  it('theme classic sets era to classic in settings store', async () => {
    const { useSettings } = await import('@/lib/settings/store')
    await runCommand('theme classic', ctx)
    expect(useSettings.getState().era).toBe('classic')
    await runCommand('theme tahoe', ctx)
    expect(useSettings.getState().era).toBe('tahoe')
  })

  it('theme without valid arg returns usage', async () => {
    const out = await runCommand('theme', ctx)
    expect(out).toMatch(/usage/)
  })
```

- [ ] **Step 4: Run tests**

```bash
bun run test apps/terminal/commands.test.ts
```
Expected: 10/10 PASS (8 existing + 2 new).

- [ ] **Step 5: Build**

```bash
bun run typecheck
bun run lint
bun run build
```

- [ ] **Step 6: Commit**

```bash
git add apps/settings/AppearancePane.tsx apps/terminal/commands.ts apps/terminal/commands.test.ts
git commit -m "feat(retro): Era picker in Settings + 'theme classic|tahoe' Terminal command"
```

---

### Task 8: Retro boot screen variant

**Files:**
- Modify: `components/os/BootScreen.tsx`

- [ ] **Step 1: Era-aware boot screen**

Read existing `components/os/BootScreen.tsx`. Replace with era-aware variant:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { useSettings } from '@/lib/settings/store'
import { AppleLogo } from './AppleLogo'

export function BootScreen({ onDone }: { onDone: () => void }) {
  const era = useSettings((s) => s.era)
  const reduceMotion = useSettings((s) => s.reduceMotion)
  const [pct, setPct] = useState(0)
  const total = reduceMotion ? 200 : 1200

  useEffect(() => {
    const start = Date.now()
    const t = setInterval(() => {
      const elapsed = Date.now() - start
      const p = Math.min(100, (elapsed / total) * 100)
      setPct(p)
      if (p >= 100) {
        clearInterval(t)
        onDone()
      }
    }, 30)
    const onClick = () => onDone()
    window.addEventListener('click', onClick, { once: true })
    return () => {
      clearInterval(t)
      window.removeEventListener('click', onClick)
    }
  }, [onDone, total])

  if (era === 'classic') {
    return (
      <div className="fixed inset-0 z-[100] bg-[#c0c0c0] flex flex-col items-center justify-center gap-6 text-black font-mono">
        <div className="flex flex-col items-center gap-3 px-8 py-6 border-2 border-black bg-white">
          <span className="text-5xl">🙂</span>
          <p className="text-[14px] tracking-tight">Welcome to NateOS.</p>
        </div>
        <div className="w-48 h-2 border border-black bg-white overflow-hidden">
          <div className="h-full bg-black transition-[width] duration-100" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] opacity-60">click to skip</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center gap-6 text-white">
      <AppleLogo size={88} className="text-white" />
      <div className="w-48 h-1 bg-white/15 rounded-full overflow-hidden">
        <div
          className="h-full bg-white/85 transition-[width] duration-100"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] opacity-50">click to skip</p>
    </div>
  )
}
```

(The "🙂" is a stand-in for the System 7 Happy Mac. Lossy but recognizable. If you're feeling motivated, swap for an inline SVG of a Mac with a smiley CRT face — not required.)

- [ ] **Step 2: Build**

```bash
bun run typecheck
bun run lint
bun run build
```

- [ ] **Step 3: Commit**

```bash
git add components/os/BootScreen.tsx
git commit -m "feat(retro): Classic-era Happy Mac boot screen"
```

---

### Task 9: Global Konami → About This Mac

**Files:**
- Create: `lib/os/use-konami.ts`, `components/os/KonamiTrigger.tsx`
- Modify: `app/HomeClient.tsx`

- [ ] **Step 1: Konami hook**

`lib/os/use-konami.ts`:
```ts
'use client'
import { useEffect } from 'react'

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
] as const

export function useKonami(onMatch: () => void) {
  useEffect(() => {
    let buf: string[] = []
    function onKey(e: KeyboardEvent) {
      buf = [...buf, e.key].slice(-KONAMI.length)
      if (buf.length === KONAMI.length && buf.every((k, i) => k === KONAMI[i])) {
        buf = []
        onMatch()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onMatch])
}
```

- [ ] **Step 2: Konami trigger component**

`components/os/KonamiTrigger.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { useKonami } from '@/lib/os/use-konami'
import { AboutDialog } from './menubar/AboutDialog'

export function KonamiTrigger() {
  const [open, setOpen] = useState(false)
  useKonami(() => setOpen(true))
  return <AboutDialog open={open} onClose={() => setOpen(false)} />
}
```

(Reuses the existing `AboutDialog` component. Calculator's local Konami → Snake remains untouched; the global one fires regardless of which app is focused.)

- [ ] **Step 3: Mount in HomeClient**

Modify `app/HomeClient.tsx` — add `<KonamiTrigger />` next to `<EraClass />`:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { BootScreen } from '@/components/os/BootScreen'
import { EraClass } from '@/components/os/EraClass'
import { KonamiTrigger } from '@/components/os/KonamiTrigger'
import { useWindowStore } from '@/lib/os/window-store'

const KEY = 'nateos_booted'

export function HomeClient() {
  const [booting, setBooting] = useState<boolean>(false)
  const openApp = useWindowStore((s) => s.openApp)
  const windows = useWindowStore((s) => s.windows)

  useEffect(() => {
    const already = sessionStorage.getItem(KEY) === '1'
    if (already) {
      ensureTerminal()
    } else {
      setBooting(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function ensureTerminal() {
    if (!windows.find((w) => w.appId === 'terminal')) {
      openApp('terminal')
    }
  }

  function onBootDone() {
    sessionStorage.setItem(KEY, '1')
    setBooting(false)
    ensureTerminal()
  }

  return (
    <>
      <EraClass />
      <KonamiTrigger />
      {booting ? <BootScreen onDone={onBootDone} /> : null}
    </>
  )
}
```

- [ ] **Step 4: Build**

```bash
bun run typecheck
bun run lint
bun run build
```

- [ ] **Step 5: Commit**

```bash
git add lib/os/use-konami.ts components/os/KonamiTrigger.tsx app/HomeClient.tsx
git commit -m "feat(easter): global Konami → About This Mac dialog"
```

---

### Task 10: Force-quit dialog (Cmd+Opt+Esc)

**Files:**
- Create: `components/os/ForceQuit.tsx`
- Modify: `app/HomeClient.tsx`

- [ ] **Step 1: ForceQuit component**

`components/os/ForceQuit.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'
import { byId } from '@/lib/os/registry'
import { useWindowStore } from '@/lib/os/window-store'

export function ForceQuit() {
  const [open, setOpen] = useState(false)
  const windows = useWindowStore((s) => s.windows)
  const closeWindow = useWindowStore((s) => s.closeWindow)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Cmd+Opt+Esc on macOS, Ctrl+Alt+Esc on others
      if (e.key === 'Escape' && e.altKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  const visibleWins = windows.filter((w) => w.state !== 'min')

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click-to-close is standard modal behavior
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false)
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Force Quit Applications"
        className="w-[380px] rounded-2xl border border-white/10 shadow-2xl backdrop-blur-2xl bg-zinc-900/90 text-white overflow-hidden"
      >
        <header className="px-5 py-3 border-b border-white/10">
          <h2 className="text-[14px] font-semibold">Force Quit Applications</h2>
          <p className="text-[11px] opacity-60 mt-0.5">
            If an app doesn't respond for a while, select its name and click Force Quit.
          </p>
        </header>
        <ul className="max-h-[260px] overflow-auto os-scroll py-1">
          {visibleWins.length === 0 ? (
            <li className="px-5 py-6 text-center opacity-60 text-[12px]">
              Nothing to quit. (Not Responding)
            </li>
          ) : (
            visibleWins.map((w) => {
              const m = byId[w.appId]
              if (!m) return null
              const isActive = selectedId === w.id
              return (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(w.id)}
                    className={`w-full text-left px-5 py-1.5 text-[13px] flex items-center gap-3 ${
                      isActive ? 'bg-blue-500/80 text-white' : 'hover:bg-white/5'
                    }`}
                  >
                    <m.icon size={20} />
                    <span className="flex-1">{m.title}</span>
                    {w.appId === 'terminal' ? (
                      <span className="text-[10px] opacity-50">(Not Responding)</span>
                    ) : null}
                  </button>
                </li>
              )
            })
          )}
        </ul>
        <footer className="px-5 py-3 border-t border-white/10 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-[12px]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedId}
            onClick={() => {
              if (selectedId) closeWindow(selectedId)
              setSelectedId(null)
              setOpen(false)
            }}
            className="px-3 py-1.5 rounded-md bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-[12px] font-medium"
          >
            Force Quit
          </button>
        </footer>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Mount in HomeClient**

Add `<ForceQuit />` to `app/HomeClient.tsx`:

```tsx
import { ForceQuit } from '@/components/os/ForceQuit'

// ... in the returned JSX:
return (
  <>
    <EraClass />
    <KonamiTrigger />
    <ForceQuit />
    {booting ? <BootScreen onDone={onBootDone} /> : null}
  </>
)
```

- [ ] **Step 3: Build**

```bash
bun run typecheck
bun run lint
bun run build
```

- [ ] **Step 4: Commit**

```bash
git add components/os/ForceQuit.tsx app/HomeClient.tsx
git commit -m "feat(easter): Force Quit dialog (Cmd+Opt+Esc)"
```

---

### Task 11: `sudo hire-me` Terminal command

**Files:**
- Modify: `apps/terminal/commands.ts`, `apps/terminal/commands.test.ts`

- [ ] **Step 1: Add command**

Read `apps/terminal/commands.ts`. Add `sudo hire-me` handling — before the `default` branch in the switch:

```ts
    case 'sudo': {
      if (args[0] === 'hire-me') {
        ctx.openApp('messages')
        return 'Permission granted. Opening Messages…'
      }
      return `nateos: ${args.join(' ')}: sudo not supported. Try 'sudo hire-me'.`
    }
```

(Place after `case 'resume':` and before `case '':`.)

Also extend the help text:
- Find the existing `HELP_LINES` array and add a line at the end:
```ts
  'sudo hire-me               (try it)',
```

And the tab-complete candidates list in `apps/terminal/Term.tsx` — read the file, find `const candidates = [...]`, add `'sudo'` at the end. (This is in Term.tsx, not commands.ts.)

- [ ] **Step 2: Tests**

Append to `apps/terminal/commands.test.ts` describe block:

```ts
  it('sudo hire-me opens Messages and confirms permission granted', async () => {
    const out = await runCommand('sudo hire-me', ctx)
    expect(ctx.openApp).toHaveBeenCalledWith('messages')
    expect(out).toMatch(/permission granted/i)
  })

  it('sudo without hire-me returns helpful error', async () => {
    const out = await runCommand('sudo rm -rf', ctx)
    expect(out).toMatch(/sudo not supported/)
  })
```

- [ ] **Step 3: Run tests**

```bash
bun run test apps/terminal/commands.test.ts
```
Expected: 12/12 PASS.

- [ ] **Step 4: Build**

```bash
bun run typecheck
bun run lint
bun run build
```

- [ ] **Step 5: Commit**

```bash
git add apps/terminal/commands.ts apps/terminal/commands.test.ts apps/terminal/Term.tsx
git commit -m "feat(easter): 'sudo hire-me' Terminal command opens Messages"
```

---

### Task 12: Mobile-aware Wallpaper (cosmetic) + final polish

**Files:**
- Modify: `components/os/Wallpaper.tsx` (only if needed — DesktopShell already swaps to MobileShell, so Wallpaper isn't rendered on mobile; no change required)
- Verify nothing else needs trimming for mobile.

- [ ] **Step 1: Verification only**

Mobile path goes through `MobileShell` and never renders `Wallpaper`, `Menubar`, `Dock`, `WindowLayer`, or `DesktopWidgets`. Confirm by reading `MobileShell.tsx`.

If anything breaks, fix locally. Otherwise no commit needed.

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

All clean.

If you find lurking issues — missing imports, dead-but-referenced exports, etc. — fix and commit:
```bash
git add -A
git commit -m "chore: post-mobile sanity pass"
```

---

### Task 13: Deploy checklist

**Files:**
- Create: `docs/DEPLOY.md`

This task is mostly user-driven. The agent writes the checklist; the user runs it.

- [ ] **Step 1: Write deploy doc**

`docs/DEPLOY.md`:
```markdown
# NateOS — Deploy

Branch `feature/foundation` carries Plans 1–3. After verifying locally, ship to Vercel and cut over `nate.cx` DNS.

## Local verification

```bash
bun run typecheck
bun run lint
bun run check:content
bun run test
bun run build
```

All clean. `public/resume.pdf`, `public/contact.vcf`, `public/qr.png` regenerated by `prebuild`.

## Vercel project setup (one-time)

1. https://vercel.com/new → import the GitHub repo (or run `vercel` CLI from the repo root).
2. Framework: Next.js (auto-detected).
3. Build command override: `bun run build`. Install command: `bun install --frozen-lockfile`.
4. Set environment variables in Vercel project settings → Environment Variables:
   - `RESEND_API_KEY` = the production API key from https://resend.com/api-keys
   - `GITHUB_TOKEN` = optional read-only PAT for higher rate-limit on `/api/github` (60/hr unauthenticated)
5. Deploy preview from `feature/foundation`. Visit the preview URL.

## Manual smoke checklist (preview URL)

- [ ] `/` → boot animation → desktop with Terminal open by default
- [ ] Click each dock app → opens, content renders
- [ ] `/resume` → Resume window opens directly (skips boot)
- [ ] `/projects/idea` → Projects opens with IDEA selected
- [ ] Settings → Wallpaper picker → live wallpaper switch
- [ ] Settings → Era → Classic → window chrome turns B&W; Tahoe → returns
- [ ] Terminal: `theme classic`, `apps`, `cat resume.mdx`, `sudo hire-me`
- [ ] Konami code (↑↑↓↓←→←→ba) → About This Mac dialog
- [ ] Cmd+Opt+Esc (Mac) / Ctrl+Alt+Esc (Win/Linux) → Force Quit dialog
- [ ] Messages → submit form → returns 200 (real Resend send) or 503 (key missing)
- [ ] QR code on desktop → click → downloads `contact.vcf`
- [ ] Resume.pdf shortcut → downloads PDF
- [ ] Mobile: open preview URL on phone → bottom-tab UI; tabs work; deeplinks land on right tab

## Resend domain verification (recommended)

The default `from:` is `NateOS <onboarding@resend.dev>` (Resend's shared sender). For better deliverability, set up `nate.cx` in Resend:

1. https://resend.com/domains → Add Domain → `nate.cx`
2. Add the DNS records Resend shows (SPF + DKIM + DMARC) at the registrar / DNS host.
3. Wait for verification.
4. Edit `app/api/messages/route.ts`: change `FROM` to `'NateOS <noreply@nate.cx>'` (or another address on the verified domain).
5. Redeploy.

## Cal.com setup

`apps/calendar/app.tsx` embeds `https://cal.com/nateofarrell/intro`. Either:
- Create that booking link at https://cal.com/, OR
- Edit `CAL_LINK` in `apps/calendar/app.tsx` to your real Cal.com URL.

## DNS cutover (`nate.cx` → Vercel)

The current `nate.cx` already runs Next.js on Vercel. Adding the domain to the new project and following Vercel's prompts handles the cutover automatically.

1. In the new Vercel project: Settings → Domains → Add `nate.cx`.
2. Vercel detects the existing project and offers to transfer. Accept.
3. (If asked instead for DNS records) update at the registrar:
   - A `@` → `76.76.21.21` (Vercel anycast)
   - CNAME `www` → `cname.vercel-dns.com`
4. Vercel auto-provisions the cert. Wait for green checkmark.
5. Visit `https://nate.cx/` → should load NateOS.

## Post-deploy

- Tag the commit: `git tag -a release-v1.0.0 -m "NateOS public launch" && git push origin release-v1.0.0`
- Optional: Vercel Web Analytics + Speed Insights are wired by default (no code change). Confirm they're showing data after a day.
- Watch Resend dashboard for first delivered messages.
```

- [ ] **Step 2: Commit**

```bash
git add docs/DEPLOY.md
git commit -m "docs: deploy checklist (Vercel + Resend + Cal.com + DNS cutover)"
```

- [ ] **Step 3: Open PR (manual, by user)**

```bash
git push -u origin feature/foundation
```

Then either merge into `main` via GitHub UI, or:
```bash
git checkout main
git merge --ff-only feature/foundation
git push origin main
```

The agent stops here. Vercel deploy + DNS cutover is a manual user action because it touches accounts and DNS.

---

### Task 14: Final tag

**Files:** none. Tag only.

- [ ] **Step 1: Tag**

```bash
git tag -a launch-v1 -m "NateOS feature-complete: Plans 1–3 shipped (foundation + content + mobile + retro + easter eggs)"
```

---

## Self-review

**Spec coverage check** vs `2026-05-03-nateos-portfolio-design.md`:

| Spec section | Plan 3 task |
|--------------|-------------|
| §7.2 Mobile bottom-tab single-window mode | T1 (viewport hook), T2 (TabBar), T3 (MobileShell), T4 (DesktopShell switch) |
| §7.3 Era toggle — Tahoe primary, Classic = chrome + boot + fonts | T5 (era state), T6 (era CSS), T7 (Settings + Terminal toggle), T8 (retro boot) |
| §8.1 Easter eggs — Konami → About | T9 |
| §8.1 Easter eggs — Force-quit dialog (Cmd+Opt+Esc) | T10 |
| §8.1 Easter eggs — `sudo hire-me` | T11 |
| §8.1 Easter eggs — `theme classic` | T7 |
| §8.1 Easter eggs — Restart replays boot (Apple menu) | already shipped in Plan 1 |
| §11 Build + deploy (Vercel) | T13 |
| §18 Risks: Cal.com link confirm, Resend `nate.cx` DNS | T13 (deploy doc) |
| §20 Acceptance criteria #11 — adding new app via manifest works | already validated through Plans 1–2 |

**Out of scope deliberately (per top of plan):**
- App-interior retro reskinning
- iOS-style springboard mobile experience
- Sentry / observability
- Real wallpaper picker for retro era
- Actual Vercel deploy + DNS (user-driven)

**Placeholder scan:** No "TBD/TODO/implement later". All steps include the exact file content or command. Test code blocks include real assertions.

**Type consistency:**
- `Era = 'tahoe' | 'classic'` exported from `lib/settings/store.ts` and consumed by `BootScreen`, `EraClass`, `AppearancePane`, and Terminal `theme` command.
- `TabId` exported from `MobileTabBar.tsx` and reused by `MobileShell`.
- `Viewport` from `useViewport` consumed by `DesktopShell`.
- Marker classes (`nateos-window`, `nateos-window-titlebar`, `nateos-window-title`, `nateos-traffic-light`, `nateos-menubar`, `nateos-dock`, `nateos-wallpaper`) match between CSS and component edits.

---

## Execution handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-04-nateos-mobile-retro-eggs.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — fresh subagent per task, two-stage review, fast iteration.

**2. Inline Execution** — run tasks in this session using executing-plans, batch checkpoints.

**Which approach?**
