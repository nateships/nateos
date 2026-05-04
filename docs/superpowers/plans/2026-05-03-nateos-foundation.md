# NateOS — Plan 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy nate.cx with a working macOS-style OS shell — boot screen, desktop, dock, menubar, draggable windows, deeplink router, Terminal app open by default with full command set, and 11 app stubs visible in the dock. Foundation is complete; per-app content lands in Plan 2.

**Architecture:** Next.js 16.2.4 App Router on Vercel. Zustand-managed window store. Plugin-style App Registry: each app under `apps/<id>/` declares a manifest the shell consumes. URL-driven deeplinks via `nuqs`. MDX content infra wired (sample only this plan). Apple-extracted assets in `public/apple/`.

**Tech Stack:** Bun · Next.js 16.2.4 · React 19 · TypeScript strict · Tailwind v4 · Biome · Zustand · nuqs · Zod · @next/mdx · react-pdf · qrcode · Resend (deps installed, used in Plan 2).

---

## File Structure (created in this plan)

```
portfolio/
  app/
    layout.tsx                  # root layout w/ DesktopShell wrap
    page.tsx                    # / → boot then desktop
    profile/page.tsx            # deeplink stub
    resume/page.tsx
    projects/page.tsx
    projects/[slug]/page.tsx
    terminal/page.tsx
    messages/page.tsx
    safari/page.tsx
    finder/page.tsx
    settings/page.tsx
    calendar/page.tsx
    textedit/page.tsx
    calculator/page.tsx
    api/messages/route.ts       # stub (501) — wired in Plan 2
    api/chat/route.ts           # stub (501) — future AI
  apps/
    profile/{manifest.ts,app.tsx,icon.tsx}
    resume/{...}
    projects/{...}
    terminal/{manifest.ts,app.tsx,icon.tsx,commands.ts,parser.ts}
    messages/{...}
    safari/{...}
    finder/{...}
    settings/{...}
    calendar/{...}
    textedit/{...}
    calculator/{...}
  components/
    os/
      DesktopShell.tsx
      Wallpaper.tsx
      Menubar.tsx
      Dock.tsx
      WindowLayer.tsx
      Window.tsx
      BootScreen.tsx
      ComingSoon.tsx
    deeplink/
      DeeplinkRouter.tsx
  lib/
    os/
      types.ts                  # AppManifest, WindowState
      registry.ts               # barrel of all manifests
      window-store.ts           # Zustand
      deeplink.ts               # URL ↔ store helpers
    content/
      schema.ts                 # Zod content schemas
      load.ts                   # MDX loader
  content/
    profile.mdx                 # placeholder content (real in Plan 2)
    resume.mdx                  # placeholder content (real in Plan 2)
    projects/_index.mdx
    links.mdx
  public/
    apple/                      # extracted icons + wallpapers (gitignored optional? committed)
    fonts/                      # SF Pro woff2
  scripts/
    extract-apple-assets.sh
  .github/workflows/ci.yml
  bunfig.toml
  next.config.ts
  tailwind.config.ts
  biome.json
  tsconfig.json
  package.json
  .env.example
  .env.local                    # gitignored
```

---

### Task 1: Project init — Bun + Next.js 16.2.4 + TS strict

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `bunfig.toml`, `.gitignore` (append), `app/layout.tsx`, `app/page.tsx`

- [ ] **Step 1: Confirm Bun installed**

Run: `bun --version`
Expected: `1.x.x` (any 1.x). If missing: `curl -fsSL https://bun.sh/install | bash`.

- [ ] **Step 2: Init Next.js 16.2.4 in current directory**

The repo already has `README.md` and `.gitignore`. Use `--use-bun` and skip the example so files don't conflict.

Run from repo root:
```bash
bunx create-next-app@16.2.4 . \
  --typescript --tailwind --eslint=false --app --src-dir=false \
  --import-alias="@/*" --use-bun --turbopack --no-experimental-app
```

If interactive prompts appear, accept defaults (TypeScript: yes, ESLint: no, Tailwind: yes, App Router: yes, src/: no, alias: `@/*`).

Expected: `app/`, `package.json`, `next.config.ts`, `tsconfig.json` created. `node_modules/` populated by Bun.

If `create-next-app` refuses because the dir is non-empty, manually scaffold instead:
```bash
bun init -y
bun add next@16.2.4 react@^19 react-dom@^19
bun add -D typescript @types/react @types/node @types/react-dom
```
Then create `next.config.ts`, `tsconfig.json`, `app/layout.tsx`, `app/page.tsx` per Step 3.

- [ ] **Step 3: Verify `tsconfig.json` has strict mode**

Open `tsconfig.json`, confirm:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Add any missing fields. Save.

- [ ] **Step 4: Replace `app/page.tsx` and `app/layout.tsx` with NateOS scaffolds**

`app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NateOS — Nate O’Farrell',
  description: 'Director of Infrastructure & Platform Engineering. Hands-on builder.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white overflow-hidden">
        {children}
      </body>
    </html>
  )
}
```

`app/page.tsx`:
```tsx
export default function Home() {
  return (
    <main className="h-screen w-screen flex items-center justify-center text-white">
      <p>NateOS scaffold — Task 1 done</p>
    </main>
  )
}
```

- [ ] **Step 5: Run dev server, verify scaffold loads**

Run (separate terminal): `bun run dev`
Expected: server boots on `http://localhost:3000`, page shows "NateOS scaffold — Task 1 done". Stop with Ctrl-C.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 16.2.4 + Bun + TS strict"
```

---

### Task 2: Add Tailwind v4 + Biome + add `.env.example`

**Files:**
- Modify: `package.json`, `app/globals.css`, `tailwind.config.ts` (or v4 CSS-first config in globals)
- Create: `biome.json`, `.env.example`

- [ ] **Step 1: Install Biome**

Run: `bun add -D @biomejs/biome`

Expected: `@biomejs/biome` appears under devDependencies.

- [ ] **Step 2: Create `biome.json`**

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "style": { "noNonNullAssertion": "off" },
      "correctness": { "useExhaustiveDependencies": "warn" }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "trailingCommas": "all"
    }
  },
  "files": {
    "ignore": [".next", "node_modules", "public/apple", ".superpowers"]
  }
}
```

- [ ] **Step 3: Add scripts to `package.json`**

Edit `package.json` `"scripts"` to include:
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "biome check .",
    "format": "biome format --write .",
    "typecheck": "tsc --noEmit",
    "check:content": "bun run scripts/check-content.ts",
    "extract:apple": "bash scripts/extract-apple-assets.sh"
  }
}
```

- [ ] **Step 4: Verify Tailwind v4 already installed by create-next-app**

Run: `grep -E '"tailwindcss"|"@tailwindcss/postcss"' package.json`
Expected: matches `"tailwindcss": "^4..."`. If `^3` was installed, upgrade:
```bash
bun add -D tailwindcss@^4 @tailwindcss/postcss@^4
```

Confirm `app/globals.css` starts with:
```css
@import "tailwindcss";
```
(That's v4 syntax. If it has `@tailwind base; @tailwind components; @tailwind utilities;` v3 syntax, replace with the single `@import` line.)

- [ ] **Step 5: Add NateOS theme tokens to `app/globals.css`**

Append to `app/globals.css`:
```css
@theme {
  --font-sans: 'SF Pro Text', 'Inter', system-ui, sans-serif;
  --font-mono: ui-monospace, 'SF Mono', Menlo, monospace;
  --color-os-bg: #000;
  --color-os-glass: rgba(255, 255, 255, 0.18);
  --color-os-glass-dark: rgba(20, 20, 24, 0.55);
  --color-os-traffic-r: #ff5f57;
  --color-os-traffic-y: #febc2e;
  --color-os-traffic-g: #28c840;
}

html, body { height: 100%; }
body { font-family: var(--font-sans); }
```

- [ ] **Step 6: Create `.env.example`**

```
RESEND_API_KEY=re_...
GITHUB_TOKEN=ghp_...
NEXT_PUBLIC_VERCEL_ANALYTICS=1
```

Append `.env.local` to `.gitignore` if not present:
```bash
grep -q '^\.env\.local$' .gitignore || echo '.env.local' >> .gitignore
```

- [ ] **Step 7: Run lint + format**

```bash
bun run format
bun run lint
```

Expected: no errors after format.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: tailwind v4 theme + biome + env scaffold"
```

---

### Task 3: Install OS-shell deps

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime + content + future-API deps**

```bash
bun add zustand nuqs zod @next/mdx @mdx-js/loader @mdx-js/react gray-matter rehype-pretty-code shiki uuid resend qrcode
bun add -D @types/uuid @types/qrcode
```

- [ ] **Step 2: Install future-feature deps (used in Plan 2)**

```bash
bun add @react-pdf/renderer
```

- [ ] **Step 3: Verify install**

Run: `bun pm ls --depth=0 | head -30`
Expected: zustand, nuqs, zod, @next/mdx, resend, qrcode, uuid all listed.

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lockb
git commit -m "chore: add OS-shell + content + future-api deps"
```

---

### Task 4: Apple asset extraction script

**Files:**
- Create: `scripts/extract-apple-assets.sh`, `public/apple/.gitkeep`

- [ ] **Step 1: Write extraction script**

`scripts/extract-apple-assets.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail

# NateOS — extract Apple assets from local macOS for use in the portfolio.
# Run only on macOS dev machines. Output: public/apple/{icons,wallpapers,fonts}.
# Note: Apple copyrighted material. Accepted risk per design spec section 18.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/apple"
mkdir -p "$OUT/icons" "$OUT/wallpapers" "$OUT/fonts"

if [[ "$(uname)" != "Darwin" ]]; then
  echo "ERROR: must run on macOS." >&2
  exit 1
fi

echo "Extracting app icons from /System/Applications/..."
APPS=(Finder Safari Calendar Calculator Messages TextEdit Terminal "System Preferences" "System Settings")
for app in "${APPS[@]}"; do
  src="/System/Applications/$app.app/Contents/Resources/AppIcon.icns"
  if [[ ! -f "$src" ]]; then
    src="/System/Library/CoreServices/$app.app/Contents/Resources/AppIcon.icns"
  fi
  if [[ -f "$src" ]]; then
    name="$(echo "$app" | tr '[:upper:] ' '[:lower:]-').icns"
    cp "$src" "$OUT/icons/$name"
    # Convert to PNG @ 256 for web use
    base="${name%.icns}"
    sips -s format png "$src" --out "$OUT/icons/$base.png" --resampleHeightWidthMax 256 >/dev/null
    echo "  + $base"
  else
    echo "  ! missing: $app" >&2
  fi
done

echo "Extracting Finder + system file icons from CoreTypes.bundle..."
CORE="/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources"
for f in FinderIcon.icns GenericFolderIcon.icns GenericDocumentIcon.icns AlertCautionIcon.icns; do
  if [[ -f "$CORE/$f" ]]; then
    cp "$CORE/$f" "$OUT/icons/"
    base="${f%.icns}"
    sips -s format png "$CORE/$f" --out "$OUT/icons/$base.png" --resampleHeightWidthMax 256 >/dev/null
  fi
done

echo "Extracting wallpapers..."
WPS=("/System/Library/Desktop Pictures" "/Library/Desktop Pictures")
for d in "${WPS[@]}"; do
  if [[ -d "$d" ]]; then
    find "$d" -maxdepth 2 -type f \( -name "*.heic" -o -name "*.jpg" -o -name "*.png" \) -print0 \
      | xargs -0 -I {} cp -n {} "$OUT/wallpapers/" 2>/dev/null || true
  fi
done

echo "Extracting SF fonts..."
for f in "SF-Pro.ttf" "SF-Pro-Text-Regular.otf" "SFNS.ttf" "SFNSMono.ttf"; do
  src="/System/Library/Fonts/$f"
  if [[ -f "$src" ]]; then
    cp "$src" "$OUT/fonts/"
  fi
done

echo "Done. $(find "$OUT" -type f | wc -l | tr -d ' ') files in $OUT"
```

- [ ] **Step 2: Make executable, run it**

```bash
chmod +x scripts/extract-apple-assets.sh
bun run extract:apple
```

Expected: `public/apple/icons/*.png` (≥6 entries), `public/apple/wallpapers/*` (≥1), no fatal errors. Missing apps logged but not fatal.

- [ ] **Step 3: Pick a default wallpaper**

Inspect `public/apple/wallpapers/`. Pick one (Tahoe-era preferred; otherwise any blue/dark gradient). Note its filename for Task 8.

- [ ] **Step 4: Add `public/apple/.gitkeep`**

```bash
touch public/apple/.gitkeep
```

- [ ] **Step 5: Commit**

```bash
git add scripts/extract-apple-assets.sh public/apple/
git commit -m "feat: extract Apple icons/wallpapers/fonts for NateOS"
```

---

### Task 5: AppManifest types

**Files:**
- Create: `lib/os/types.ts`

- [ ] **Step 1: Define core types**

`lib/os/types.ts`:
```ts
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
```

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/os/types.ts
git commit -m "feat: AppManifest + WindowState types"
```

---

### Task 6: App Registry barrel + 11 stub manifests

**Files:**
- Create:
  - `apps/<id>/manifest.ts` (×11)
  - `apps/<id>/icon.tsx` (×11)
  - `apps/<id>/app.tsx` (×11) — uses `<ComingSoon>` placeholder
  - `components/os/ComingSoon.tsx`
  - `lib/os/registry.ts`

- [ ] **Step 1: Create `<ComingSoon>` placeholder**

`components/os/ComingSoon.tsx`:
```tsx
export function ComingSoon({ name }: { name: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-2 p-8 text-center">
      <h2 className="text-xl font-semibold">{name}</h2>
      <p className="text-sm opacity-60">Coming in Plan 2.</p>
    </div>
  )
}
```

- [ ] **Step 2: Generic icon helper**

`apps/_shared/AppleIcon.tsx`:
```tsx
import Image from 'next/image'

export function AppleIcon({ src, alt, size = 48 }: { src: string; alt: string; size?: number }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ borderRadius: 8 }}
      priority
    />
  )
}
```

- [ ] **Step 3: Create 11 app folders with manifest, icon, app.tsx**

Pattern per app — replicate for each id below. Use this profile manifest as template:

`apps/profile/manifest.ts`:
```ts
import type { AppManifest } from '@/lib/os/types'
import { ProfileApp } from './app'
import { ProfileIcon } from './icon'

export const manifest: AppManifest = {
  id: 'profile',
  title: 'Profile',
  icon: ProfileIcon,
  route: '/profile',
  component: ProfileApp,
  defaultSize: { w: 720, h: 540 },
  minSize: { w: 420, h: 320 },
  capabilities: ['resize', 'minimize'],
  surfaces: ['dock', 'launchpad', 'spotlight'],
  category: 'core',
}
```

`apps/profile/icon.tsx`:
```tsx
import { AppleIcon } from '@/apps/_shared/AppleIcon'
export function ProfileIcon({ size }: { size?: number }) {
  return <AppleIcon src="/apple/icons/profile.png" alt="Profile" size={size} />
}
```

`apps/profile/app.tsx`:
```tsx
import { ComingSoon } from '@/components/os/ComingSoon'
export function ProfileApp() { return <ComingSoon name="Profile" /> }
```

Repeat with these (id, title, default icon path, route):

| id | title | icon path | route | defaultSize |
|----|-------|-----------|-------|-------------|
| profile | Profile | `/apple/icons/profile.png` (placeholder; substitute any extracted) | `/profile` | 720×540 |
| resume | Resume | `/apple/icons/textedit.png` | `/resume` | 900×640 |
| projects | Projects | `/apple/icons/genericfoldericon.png` | `/projects` | 960×620 |
| terminal | Terminal | `/apple/icons/terminal.png` | `/terminal` | 720×440 |
| messages | Messages | `/apple/icons/messages.png` | `/messages` | 600×500 |
| safari | Safari | `/apple/icons/safari.png` | `/safari` | 1000×680 |
| finder | Finder | `/apple/icons/findericon.png` | `/finder` | 880×560 |
| settings | Settings | `/apple/icons/system-settings.png` | `/settings` | 720×500 |
| calendar | Calendar | `/apple/icons/calendar.png` | `/calendar` | 880×600 |
| textedit | TextEdit | `/apple/icons/textedit.png` | `/textedit` | 720×560 |
| calculator | Calculator | `/apple/icons/calculator.png` | `/calculator` | 320×500 |

For any missing icon file (some extractions fail), fall back to `/apple/icons/genericdocumenticon.png` and note in a TODO file `apps/_TODO_icons.md`. **Don't block on missing icons.**

Add `capabilities: ['multi-instance', 'resize', 'minimize']` for `textedit` (and `terminal` if desired). Otherwise default `['resize', 'minimize']`.

- [ ] **Step 4: Create registry barrel**

`lib/os/registry.ts`:
```ts
import { manifest as profile } from '@/apps/profile/manifest'
import { manifest as resume } from '@/apps/resume/manifest'
import { manifest as projects } from '@/apps/projects/manifest'
import { manifest as terminal } from '@/apps/terminal/manifest'
import { manifest as messages } from '@/apps/messages/manifest'
import { manifest as safari } from '@/apps/safari/manifest'
import { manifest as finder } from '@/apps/finder/manifest'
import { manifest as settings } from '@/apps/settings/manifest'
import { manifest as calendar } from '@/apps/calendar/manifest'
import { manifest as textedit } from '@/apps/textedit/manifest'
import { manifest as calculator } from '@/apps/calculator/manifest'
import type { AppManifest } from './types'

export const registry: AppManifest[] = [
  profile, resume, projects, terminal, messages,
  safari, finder, settings, calendar, textedit, calculator,
]

export const byId: Record<string, AppManifest> =
  Object.fromEntries(registry.map((a) => [a.id, a]))

export const byRoute: Record<string, AppManifest> =
  Object.fromEntries(registry.map((a) => [a.route, a]))
```

- [ ] **Step 5: Typecheck + lint**

```bash
bun run typecheck
bun run lint
```

Expected: clean. Fix imports if any path is wrong.

- [ ] **Step 6: Commit**

```bash
git add apps/ lib/os/registry.ts components/os/ComingSoon.tsx
git commit -m "feat: app registry + 11 stub manifests"
```

---

### Task 7: Window store (Zustand) + tests

**Files:**
- Create: `lib/os/window-store.ts`, `lib/os/window-store.test.ts`

- [ ] **Step 1: Write failing tests first**

`lib/os/window-store.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useWindowStore } from './window-store'

describe('window-store', () => {
  beforeEach(() => {
    useWindowStore.getState().reset()
  })

  it('opens an app and returns a window id', () => {
    const id = useWindowStore.getState().openApp('terminal')
    const w = useWindowStore.getState().windows.find((x) => x.id === id)
    expect(w).toBeDefined()
    expect(w?.appId).toBe('terminal')
    expect(w?.state).toBe('normal')
  })

  it('focusing a window bumps its z above all others', () => {
    const a = useWindowStore.getState().openApp('terminal')
    const b = useWindowStore.getState().openApp('resume')
    useWindowStore.getState().focusWindow(a)
    const wins = useWindowStore.getState().windows
    const ax = wins.find((w) => w.id === a)!
    const bx = wins.find((w) => w.id === b)!
    expect(ax.z).toBeGreaterThan(bx.z)
  })

  it('closing a window removes it', () => {
    const id = useWindowStore.getState().openApp('terminal')
    useWindowStore.getState().closeWindow(id)
    expect(useWindowStore.getState().windows).toHaveLength(0)
  })

  it('multi-instance: opening textedit twice yields two windows', () => {
    useWindowStore.getState().openApp('textedit', { file: 'a.md' })
    useWindowStore.getState().openApp('textedit', { file: 'b.md' })
    const wins = useWindowStore.getState().windows.filter((w) => w.appId === 'textedit')
    expect(wins).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Add Vitest**

```bash
bun add -D vitest @vitest/ui
```

Add to `package.json` scripts: `"test": "vitest run", "test:watch": "vitest"`.

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['lib/**/*.test.ts', 'apps/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

- [ ] **Step 3: Run tests, verify they fail**

Run: `bun run test`
Expected: FAIL — "Cannot find module './window-store'".

- [ ] **Step 4: Implement window store**

`lib/os/window-store.ts`:
```ts
import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type { AppParams, WindowState } from './types'
import { byId } from './registry'

type State = {
  windows: WindowState[]
  zCounter: number
  focusedId: string | null
}

type Actions = {
  openApp(appId: string, params?: AppParams): string
  closeWindow(windowId: string): void
  focusWindow(windowId: string): void
  moveWindow(windowId: string, pos: { x: number; y: number }): void
  resizeWindow(windowId: string, size: { w: number; h: number }): void
  setWindowState(windowId: string, state: WindowState['state']): void
  reset(): void
}

const initial: State = { windows: [], zCounter: 0, focusedId: null }

export const useWindowStore = create<State & Actions>((set, get) => ({
  ...initial,

  openApp(appId, params) {
    const manifest = byId[appId]
    if (!manifest) throw new Error(`Unknown appId: ${appId}`)
    const supportsMulti = manifest.capabilities.includes('multi-instance')
    if (!supportsMulti) {
      const existing = get().windows.find((w) => w.appId === appId)
      if (existing) {
        get().focusWindow(existing.id)
        return existing.id
      }
    }
    const id = uuid()
    const z = get().zCounter + 1
    const offset = get().windows.length * 24
    const w: WindowState = {
      id,
      appId,
      position: { x: 120 + offset, y: 80 + offset },
      size: manifest.defaultSize,
      state: 'normal',
      z,
      params,
    }
    set((s) => ({ windows: [...s.windows, w], zCounter: z, focusedId: id }))
    return id
  },

  closeWindow(windowId) {
    set((s) => ({
      windows: s.windows.filter((w) => w.id !== windowId),
      focusedId: s.focusedId === windowId ? null : s.focusedId,
    }))
  },

  focusWindow(windowId) {
    set((s) => {
      const z = s.zCounter + 1
      return {
        windows: s.windows.map((w) => (w.id === windowId ? { ...w, z } : w)),
        zCounter: z,
        focusedId: windowId,
      }
    })
  },

  moveWindow(windowId, pos) {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === windowId ? { ...w, position: pos } : w)),
    }))
  },

  resizeWindow(windowId, size) {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === windowId ? { ...w, size } : w)),
    }))
  },

  setWindowState(windowId, state) {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === windowId ? { ...w, state } : w)),
    }))
  },

  reset() {
    set(initial)
  },
}))
```

- [ ] **Step 5: Run tests again, verify pass**

Run: `bun run test`
Expected: 4 passing.

- [ ] **Step 6: Commit**

```bash
git add lib/os/window-store.ts lib/os/window-store.test.ts vitest.config.ts package.json
git commit -m "feat: window store w/ tests (open/close/focus/multi-instance)"
```

---

### Task 8: `<Wallpaper>` component

**Files:**
- Create: `components/os/Wallpaper.tsx`

- [ ] **Step 1: Identify wallpaper file**

Run: `ls public/apple/wallpapers | head -5`
Pick one filename (e.g. `Tahoe.heic` or `Big Sur.jpg`). Note: `.heic` won't render in browsers — convert to `.jpg`:

```bash
for f in public/apple/wallpapers/*.heic; do
  [ -f "$f" ] || continue
  out="${f%.heic}.jpg"
  sips -s format jpeg "$f" --out "$out" >/dev/null
done
ls public/apple/wallpapers/*.jpg | head
```

Choose one. If none exists, skip — fallback gradient kicks in.

- [ ] **Step 2: Component**

`components/os/Wallpaper.tsx`:
```tsx
'use client'
import Image from 'next/image'

const FALLBACK_GRADIENT =
  'linear-gradient(135deg, #2a3b5f 0%, #5e8bb8 50%, #b88a8a 100%)'

const DEFAULT_WALLPAPER = '/apple/wallpapers/default.jpg'

export function Wallpaper({ src }: { src?: string }) {
  const url = src ?? DEFAULT_WALLPAPER
  return (
    <div
      className="absolute inset-0 -z-10"
      style={{ background: FALLBACK_GRADIENT }}
    >
      <Image
        src={url}
        alt=""
        fill
        priority
        sizes="100vw"
        style={{ objectFit: 'cover' }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none'
        }}
      />
    </div>
  )
}
```

- [ ] **Step 3: Symlink default wallpaper**

```bash
cd public/apple/wallpapers
# pick one — adjust filename as needed
default_src="$(ls *.jpg 2>/dev/null | head -1)"
[ -n "$default_src" ] && ln -sf "$default_src" default.jpg
ls -la default.jpg
cd -
```

If no jpg, fallback gradient is fine.

- [ ] **Step 4: Commit**

```bash
git add components/os/Wallpaper.tsx public/apple/wallpapers/default.jpg
git commit -m "feat: Wallpaper component w/ fallback gradient"
```

---

### Task 9: `<Menubar>` component

**Files:**
- Create: `components/os/Menubar.tsx`

- [ ] **Step 1: Component**

`components/os/Menubar.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'
import { useWindowStore } from '@/lib/os/window-store'
import { byId } from '@/lib/os/registry'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])
  return now.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

export function Menubar() {
  const focusedId = useWindowStore((s) => s.focusedId)
  const windows = useWindowStore((s) => s.windows)
  const focusedApp = focusedId
    ? byId[windows.find((w) => w.id === focusedId)?.appId ?? '']
    : null
  const time = useClock()

  return (
    <div
      className="fixed top-0 inset-x-0 h-7 z-50 flex items-center px-3 gap-4 text-white text-[12px] font-medium border-b border-white/10"
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(255,255,255,0.18)',
      }}
    >
      <span aria-hidden className="text-base leading-none">🍎</span>
      <strong className="tracking-tight">{focusedApp?.title ?? 'NateOS'}</strong>
      <span className="opacity-90">File</span>
      <span className="opacity-90">Edit</span>
      <span className="opacity-90">View</span>
      <span className="opacity-90">Window</span>
      <span className="opacity-90">Help</span>
      <span className="ml-auto flex items-center gap-3">
        <span aria-hidden>🔍</span>
        <span aria-hidden>📶</span>
        <span aria-hidden>🔋 87%</span>
        <span>{time}</span>
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/os/Menubar.tsx
git commit -m "feat: Menubar with active-app title + system tray + clock"
```

---

### Task 10: `<Dock>` component

**Files:**
- Create: `components/os/Dock.tsx`

- [ ] **Step 1: Component**

`components/os/Dock.tsx`:
```tsx
'use client'
import { useWindowStore } from '@/lib/os/window-store'
import { registry } from '@/lib/os/registry'

export function Dock() {
  const windows = useWindowStore((s) => s.windows)
  const openApp = useWindowStore((s) => s.openApp)
  const focusWindow = useWindowStore((s) => s.focusWindow)
  const runningIds = new Set(windows.map((w) => w.appId))

  const dockApps = registry.filter((m) => m.surfaces.includes('dock') && !m.disabled)

  return (
    <div
      className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 flex gap-1.5 px-2 py-1.5 rounded-2xl border border-white/20"
      style={{
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        background: 'rgba(255,255,255,0.18)',
      }}
    >
      {dockApps.map((m) => {
        const Icon = m.icon
        const isRunning = runningIds.has(m.id)
        return (
          <button
            key={m.id}
            type="button"
            title={m.title}
            className="relative w-12 h-12 rounded-lg flex items-center justify-center transition-transform hover:scale-110 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white/60"
            onClick={() => {
              const existing = windows.find((w) => w.appId === m.id)
              if (existing) focusWindow(existing.id)
              else openApp(m.id)
            }}
          >
            <Icon size={44} />
            {isRunning && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
            )}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/os/Dock.tsx
git commit -m "feat: Dock w/ running indicator, click-to-open"
```

---

### Task 11: `<Window>` component (drag, traffic-lights, body)

**Files:**
- Create: `components/os/Window.tsx`

- [ ] **Step 1: Component**

`components/os/Window.tsx`:
```tsx
'use client'
import { useRef, useEffect, useState, type PointerEvent as RP } from 'react'
import { useWindowStore } from '@/lib/os/window-store'
import { byId } from '@/lib/os/registry'

export function Window({ windowId }: { windowId: string }) {
  const w = useWindowStore((s) => s.windows.find((x) => x.id === windowId))
  const focusWindow = useWindowStore((s) => s.focusWindow)
  const closeWindow = useWindowStore((s) => s.closeWindow)
  const moveWindow = useWindowStore((s) => s.moveWindow)
  const setState = useWindowStore((s) => s.setWindowState)

  const dragRef = useRef<{ dx: number; dy: number } | null>(null)
  const [, force] = useState(0)

  if (!w) return null
  const manifest = byId[w.appId]
  if (!manifest) return null
  const Comp = manifest.component

  function onPointerDown(e: RP<HTMLDivElement>) {
    if (!w) return
    focusWindow(w.id)
    dragRef.current = { dx: e.clientX - w.position.x, dy: e.clientY - w.position.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: RP<HTMLDivElement>) {
    if (!dragRef.current || !w) return
    moveWindow(w.id, { x: e.clientX - dragRef.current.dx, y: e.clientY - dragRef.current.dy })
  }
  function onPointerUp() {
    dragRef.current = null
    force((n) => n + 1)
  }

  if (w.state === 'min') return null

  const style: React.CSSProperties =
    w.state === 'fullscreen' || w.state === 'max'
      ? { top: 28, left: 0, right: 0, bottom: 0, position: 'absolute', zIndex: w.z }
      : {
          position: 'absolute',
          left: w.position.x,
          top: w.position.y,
          width: w.size.w,
          height: w.size.h,
          zIndex: w.z,
        }

  return (
    <div
      style={style}
      className="rounded-xl overflow-hidden border border-white/10 shadow-2xl text-white/90"
    >
      <div
        className="h-7 px-3 flex items-center gap-2 border-b border-white/10 select-none cursor-default"
        style={{ backdropFilter: 'blur(40px)', background: 'rgba(40,40,46,0.78)' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => setState(w.id, w.state === 'max' ? 'normal' : 'max')}
      >
        <span className="flex gap-1.5">
          <button
            type="button"
            aria-label="Close"
            className="w-3 h-3 rounded-full bg-[#ff5f57]"
            onClick={(e) => { e.stopPropagation(); closeWindow(w.id) }}
          />
          <button
            type="button"
            aria-label="Minimize"
            className="w-3 h-3 rounded-full bg-[#febc2e]"
            onClick={(e) => { e.stopPropagation(); setState(w.id, 'min') }}
          />
          <button
            type="button"
            aria-label="Maximize"
            className="w-3 h-3 rounded-full bg-[#28c840]"
            onClick={(e) => { e.stopPropagation(); setState(w.id, w.state === 'max' ? 'normal' : 'max') }}
          />
        </span>
        <span className="mx-auto -translate-x-4 text-xs opacity-70">{manifest.title}</span>
      </div>
      <div className="h-[calc(100%-1.75rem)] overflow-auto" style={{ background: 'rgba(40,40,46,0.78)' }}>
        <Comp windowId={w.id} params={w.params} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Quick smoke check**

Run: `bun run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/os/Window.tsx
git commit -m "feat: Window w/ drag + traffic-light controls + close/min/max"
```

---

### Task 12: `<WindowLayer>` compositor

**Files:**
- Create: `components/os/WindowLayer.tsx`

- [ ] **Step 1: Component**

`components/os/WindowLayer.tsx`:
```tsx
'use client'
import { useWindowStore } from '@/lib/os/window-store'
import { Window } from './Window'

export function WindowLayer() {
  const windows = useWindowStore((s) => s.windows)
  const sorted = [...windows].sort((a, b) => a.z - b.z)
  return (
    <div className="absolute inset-0 pt-7 pointer-events-none">
      <div className="relative w-full h-full pointer-events-auto">
        {sorted.map((w) => <Window key={w.id} windowId={w.id} />)}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/os/WindowLayer.tsx
git commit -m "feat: WindowLayer compositor (z-sorted)"
```

---

### Task 13: `<DesktopShell>` root

**Files:**
- Create: `components/os/DesktopShell.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Shell component**

`components/os/DesktopShell.tsx`:
```tsx
'use client'
import { Wallpaper } from './Wallpaper'
import { Menubar } from './Menubar'
import { Dock } from './Dock'
import { WindowLayer } from './WindowLayer'

export function DesktopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Wallpaper />
      <Menubar />
      <WindowLayer />
      <Dock />
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Wire into root layout**

Replace `app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import './globals.css'
import { DesktopShell } from '@/components/os/DesktopShell'

export const metadata: Metadata = {
  title: 'NateOS — Nate O’Farrell',
  description: 'Director of Infrastructure & Platform Engineering. Hands-on builder.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white overflow-hidden">
        <DesktopShell>{children}</DesktopShell>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Update `app/page.tsx` to render nothing (windows handle UI)**

```tsx
export default function Home() { return null }
```

- [ ] **Step 4: Run dev, verify desktop chrome shows**

Run: `bun run dev`
Open: http://localhost:3000

Expected: wallpaper/gradient visible, menubar at top with clock, dock at bottom with 11 icons, no windows yet.

- [ ] **Step 5: Click a dock icon → window opens (showing "Coming Soon")**

Click any dock icon. Expected: window appears, draggable from titlebar, traffic-light buttons work.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx app/page.tsx components/os/DesktopShell.tsx
git commit -m "feat: DesktopShell wires Wallpaper+Menubar+Dock+WindowLayer"
```

---

### Task 14: Boot screen

**Files:**
- Create: `components/os/BootScreen.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Boot component**

`components/os/BootScreen.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const total = 1200
    const t = setInterval(() => {
      const e = Date.now() - start
      const p = Math.min(100, (e / total) * 100)
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
  }, [onDone])

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center gap-6 text-white">
      <span className="text-7xl">🍎</span>
      <div className="w-48 h-1 bg-white/15 rounded-full overflow-hidden">
        <div className="h-full bg-white/85 transition-[width] duration-100" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] opacity-50">click to skip</p>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/os/BootScreen.tsx
git commit -m "feat: BootScreen with progress bar + click-to-skip"
```

---

### Task 15: Per-app routes (deeplink stubs)

**Files:**
- Create: `app/<app-route>/page.tsx` (×11) and `app/projects/[slug]/page.tsx`

- [ ] **Step 1: Generic route stub**

For each app, create `app/<id>/page.tsx`:

```tsx
// app/profile/page.tsx
export default function ProfileRoute() {
  return null  // OS shell handles app rendering via deeplink router
}
```

Replicate for: `profile`, `resume`, `projects`, `terminal`, `messages`, `safari`, `finder`, `settings`, `calendar`, `textedit`, `calculator`.

For projects detail:
```tsx
// app/projects/[slug]/page.tsx
export default function ProjectRoute() { return null }
```

- [ ] **Step 2: Verify all routes resolve (no 404)**

Run: `bun run dev`, visit:
- http://localhost:3000/resume
- http://localhost:3000/projects/idea
- http://localhost:3000/terminal

Expected: each shows the desktop (deeplink router not yet wired — Task 16). No 404.

- [ ] **Step 3: Commit**

```bash
git add app/
git commit -m "feat: deeplink route stubs for all 11 apps + project detail"
```

---

### Task 16: Deeplink router (URL → store)

**Files:**
- Create: `components/deeplink/DeeplinkRouter.tsx`, `lib/os/deeplink.ts`
- Modify: `components/os/DesktopShell.tsx`

- [ ] **Step 1: Helper**

`lib/os/deeplink.ts`:
```ts
import { byRoute } from './registry'

export function appIdFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return null
  // /resume, /projects, /terminal, ...
  const direct = `/${segments[0]}`
  if (byRoute[direct]) return byRoute[direct].id
  // /projects/idea → still 'projects' (deep param handled below)
  return byRoute[direct]?.id ?? null
}

export function paramsFromPath(pathname: string): Record<string, string> | undefined {
  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] === 'projects' && segments[1]) return { slug: segments[1] }
  if (segments[0] === 'textedit' && segments[1]) return { file: segments[1] }
  return undefined
}
```

- [ ] **Step 2: Router component**

`components/deeplink/DeeplinkRouter.tsx`:
```tsx
'use client'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useWindowStore } from '@/lib/os/window-store'
import { appIdFromPath, paramsFromPath } from '@/lib/os/deeplink'
import { byId } from '@/lib/os/registry'

export function DeeplinkRouter() {
  const pathname = usePathname()
  const search = useSearchParams()
  const openApp = useWindowStore((s) => s.openApp)

  useEffect(() => {
    if (pathname === '/' || pathname === '') return  // handled by Home (Task 18)
    const appId = appIdFromPath(pathname)
    if (!appId || !byId[appId]) return
    openApp(appId, paramsFromPath(pathname))
  }, [pathname, openApp])

  useEffect(() => {
    const open = search.get('open')
    if (!open) return
    for (const id of open.split(',').map((s) => s.trim()).filter(Boolean)) {
      if (byId[id]) openApp(id)
    }
  }, [search, openApp])

  return null
}
```

- [ ] **Step 3: Mount in DesktopShell**

Edit `components/os/DesktopShell.tsx` to include the router:
```tsx
'use client'
import { Wallpaper } from './Wallpaper'
import { Menubar } from './Menubar'
import { Dock } from './Dock'
import { WindowLayer } from './WindowLayer'
import { DeeplinkRouter } from '@/components/deeplink/DeeplinkRouter'
import { Suspense } from 'react'

export function DesktopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Wallpaper />
      <Menubar />
      <WindowLayer />
      <Dock />
      <Suspense fallback={null}><DeeplinkRouter /></Suspense>
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Test**

`bun run dev`, visit http://localhost:3000/resume → Resume window should open automatically. Navigate to http://localhost:3000/?open=resume,terminal → both open, terminal focused (last in list).

- [ ] **Step 5: Commit**

```bash
git add components/deeplink/DeeplinkRouter.tsx lib/os/deeplink.ts components/os/DesktopShell.tsx
git commit -m "feat: deeplink router opens apps from URL"
```

---

### Task 17: Terminal UI shell

**Files:**
- Create: `apps/terminal/app.tsx` (replace Coming Soon stub), `apps/terminal/Term.tsx`

- [ ] **Step 1: Term UI**

`apps/terminal/Term.tsx`:
```tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { runCommand, type CommandContext } from './commands'

const BANNER = String.raw`
     _   __      __     ____  _____
    / | / /___ _/ /____/ __ \/ ___/
   /  |/ / __ \`/ __/ _ \\ / / /\__ \
  / /|  / /_/ / /_/  __/ /_/ /___/ /
 /_/ |_/\__,_/\__/\___/\____//____/  v1.0
`

type Line = { kind: 'in' | 'out' | 'sys'; text: string }

export function Term({ ctx }: { ctx: CommandContext }) {
  const [history, setHistory] = useState<Line[]>([
    { kind: 'sys', text: BANNER },
    { kind: 'sys', text: 'welcome · Director of Infra @ Commonwealth Fusion · Tewksbury, MA' },
    { kind: 'sys', text: "type `help` for commands · `apps` to list · `open <app>`" },
  ])
  const [input, setInput] = useState('')
  const [stack, setStack] = useState<string[]>([])
  const [stackIdx, setStackIdx] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }) }, [history])

  async function submit() {
    const cmd = input.trim()
    if (!cmd) return
    setHistory((h) => [...h, { kind: 'in', text: `nate@nateos ~ $ ${cmd}` }])
    setStack((s) => [...s, cmd])
    setStackIdx(-1)
    setInput('')
    const out = await runCommand(cmd, ctx)
    if (out === '__CLEAR__') { setHistory([]); return }
    if (out) setHistory((h) => [...h, { kind: 'out', text: out }])
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { submit() }
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setStackIdx((i) => {
        const n = i < 0 ? stack.length - 1 : Math.max(0, i - 1)
        setInput(stack[n] ?? '')
        return n
      })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setStackIdx((i) => {
        if (i < 0) return -1
        const n = i + 1
        if (n >= stack.length) { setInput(''); return -1 }
        setInput(stack[n] ?? '')
        return n
      })
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // simple complete: built-in commands or app ids
      const candidates = ['help','apps','open','whoami','ls','cat','cd','clear','theme','about','contact','resume']
      const m = candidates.filter((c) => c.startsWith(input))
      if (m.length === 1) setInput(m[0])
    }
  }

  return (
    <div
      className="h-full w-full p-3 text-[13px] font-mono leading-relaxed text-white/90"
      style={{ background: 'rgba(20,20,24,0.92)' }}
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="h-[calc(100%-1.5rem)] overflow-auto whitespace-pre-wrap">
        {history.map((l, i) => (
          <div key={i} className={l.kind === 'sys' ? 'text-cyan-300/80' : l.kind === 'in' ? 'text-emerald-300' : ''}>
            {l.text}
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        <span className="text-emerald-300">nate@nateos</span>
        <span className="text-sky-300">~</span>
        <span>$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          className="flex-1 bg-transparent outline-none caret-emerald-300"
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace stub `app.tsx`**

`apps/terminal/app.tsx`:
```tsx
'use client'
import { Term } from './Term'
import type { AppContext } from '@/lib/os/types'
import { useWindowStore } from '@/lib/os/window-store'

export function TerminalApp(_ctx: AppContext) {
  const openApp = useWindowStore((s) => s.openApp)
  const closeWindow = useWindowStore((s) => s.closeWindow)
  return <Term ctx={{ openApp, closeWindow }} />
}
```

- [ ] **Step 3: Update manifest reference**

In `apps/terminal/manifest.ts`, the import should be `import { TerminalApp } from './app'` and `component: TerminalApp`.

- [ ] **Step 4: Typecheck**

`bun run typecheck` — expect "Cannot find module './commands'". That's intentional; Task 18 adds it. Don't commit yet.

---

### Task 18: Terminal command parser + tests

**Files:**
- Create: `apps/terminal/commands.ts`, `apps/terminal/commands.test.ts`

- [ ] **Step 1: Failing tests first**

`apps/terminal/commands.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest'
import { runCommand } from './commands'

const ctx = {
  openApp: vi.fn(),
  closeWindow: vi.fn(),
}

describe('terminal commands', () => {
  it('help lists available commands', async () => {
    const out = await runCommand('help', ctx)
    expect(out).toMatch(/help/)
    expect(out).toMatch(/open/)
    expect(out).toMatch(/apps/)
  })

  it('apps lists known apps', async () => {
    const out = await runCommand('apps', ctx)
    expect(out).toMatch(/resume/)
    expect(out).toMatch(/terminal/)
  })

  it('open <app> calls openApp', async () => {
    await runCommand('open resume', ctx)
    expect(ctx.openApp).toHaveBeenCalledWith('resume', undefined)
  })

  it('whoami returns identity', async () => {
    const out = await runCommand('whoami', ctx)
    expect(out).toMatch(/nate/i)
  })

  it('clear returns __CLEAR__ sentinel', async () => {
    const out = await runCommand('clear', ctx)
    expect(out).toBe('__CLEAR__')
  })

  it('unknown command returns helpful error', async () => {
    const out = await runCommand('whatever', ctx)
    expect(out).toMatch(/command not found/)
  })
})
```

- [ ] **Step 2: Run, expect FAIL**

`bun run test` → fails with "Cannot find module './commands'".

- [ ] **Step 3: Implement parser + commands**

`apps/terminal/commands.ts`:
```ts
import { registry } from '@/lib/os/registry'

export type CommandContext = {
  openApp(appId: string, params?: Record<string, unknown>): string
  closeWindow(windowId: string): void
}

const ABOUT =
  'Nate O’Farrell — Director of Infrastructure & Platform Engineering at\n' +
  'Commonwealth Fusion Systems. 15+ years building distributed systems.\n' +
  'Hands-on builder. Tewksbury, MA. nate@nateofarrell.com'

const HELP_LINES = [
  'help                       show this message',
  'apps                       list available apps',
  'open <app>                 open an app',
  'whoami                     who is running NateOS',
  'ls [path]                  list /content',
  'cat <file>                 print a content file',
  'cd <path>                  (cosmetic) change pwd display',
  'clear                      clear screen',
  'theme <classic|tahoe>      toggle era (Plan 3 wires retro skin)',
  'about                      one-paragraph bio',
  'contact                    open Messages app',
  'resume                     open Resume app',
]

const VFS: Record<string, string[] | string> = {
  '/': ['profile.mdx', 'resume.mdx', 'projects/', 'links.mdx'],
  '/projects/': ['idea.mdx', 'sleepbar.mdx', 'reinvent-2022.mdx', '_index.mdx'],
}

export async function runCommand(raw: string, ctx: CommandContext): Promise<string> {
  const parts = raw.trim().split(/\s+/)
  const cmd = parts[0]
  const args = parts.slice(1)

  switch (cmd) {
    case 'help':
      return HELP_LINES.join('\n')
    case 'apps':
      return registry.map((m) => `  ${m.id.padEnd(12)} ${m.title}`).join('\n')
    case 'open': {
      const id = args[0]
      if (!id) return 'usage: open <app>'
      const exists = registry.find((m) => m.id === id)
      if (!exists) return `nateos: unknown app: ${id}`
      ctx.openApp(id, undefined)
      return ''
    }
    case 'whoami':
      return 'nate (Director of Infra @ CFS — hands-on builder)'
    case 'ls': {
      const path = args[0] ?? '/'
      const norm = path.endsWith('/') || path === '/' ? path : `${path}/`
      const entry = VFS[norm]
      if (!entry) return `ls: ${path}: no such directory`
      return Array.isArray(entry) ? entry.join('  ') : entry
    }
    case 'cat': {
      const file = args[0]
      if (!file) return 'usage: cat <file>'
      // Plan 2 wires real MDX read; for now stub.
      return `(cat is wired in Plan 2 — content/${file} will render here)`
    }
    case 'cd': {
      // cosmetic only
      return ''
    }
    case 'clear':
      return '__CLEAR__'
    case 'theme': {
      const arg = args[0]
      if (!arg || !['classic', 'tahoe'].includes(arg)) return 'usage: theme <classic|tahoe>'
      // Plan 3 wires real toggle
      return `theme set to ${arg} (full retro skin lands in Plan 3)`
    }
    case 'about':
      return ABOUT
    case 'contact':
      ctx.openApp('messages')
      return ''
    case 'resume':
      ctx.openApp('resume')
      return ''
    case '':
      return ''
    default:
      return `nateos: command not found: ${cmd}. Type 'help' for available commands.`
  }
}
```

- [ ] **Step 4: Run tests**

`bun run test` → 6 passing.

- [ ] **Step 5: Smoke-test in dev server**

`bun run dev`, click Terminal in dock, run: `help`, `apps`, `open resume`. Verify each works.

- [ ] **Step 6: Commit**

```bash
git add apps/terminal/
git commit -m "feat: Terminal app w/ command set + parser tests"
```

---

### Task 19: Boot animation + Terminal-default behavior on `/`

**Files:**
- Create: `app/HomeClient.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Client wrapper**

`app/HomeClient.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'
import { BootScreen } from '@/components/os/BootScreen'
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

  if (booting) return <BootScreen onDone={onBootDone} />
  return null
}
```

- [ ] **Step 2: Wire into `app/page.tsx`**

```tsx
import { HomeClient } from './HomeClient'
export default function Home() { return <HomeClient /> }
```

- [ ] **Step 3: Verify behavior**

`bun run dev`, visit:
- `/` → boot → desktop with Terminal open. Reload → no boot (sessionStorage), Terminal still opens.
- `/resume` → no boot, Resume window opens (skip-boot for deeplinks).

Note: Resume currently shows "Coming Soon" — that's expected; content is Plan 2.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/HomeClient.tsx
git commit -m "feat: boot animation + Terminal default on /"
```

---

### Task 20: Content schema + sample MDX + check script

**Files:**
- Create: `lib/content/schema.ts`, `content/profile.mdx`, `content/resume.mdx`, `content/projects/_index.mdx`, `content/links.mdx`, `scripts/check-content.ts`

- [ ] **Step 1: Schema**

`lib/content/schema.ts`:
```ts
import { z } from 'zod'

export const Profile = z.object({
  name: z.string(),
  tagline: z.string(),
  location: z.string(),
  email: z.string().email(),
  links: z.array(z.object({ label: z.string(), url: z.string().url() })),
})
export type Profile = z.infer<typeof Profile>

export const ResumeRole = z.object({
  company: z.string(),
  title: z.string(),
  start: z.string(),
  end: z.string(),
  location: z.string(),
  bullets: z.array(z.string()),
})

export const Resume = z.object({
  summary: z.string(),
  experience: z.array(ResumeRole),
  certifications: z.array(z.string()).default([]),
  education: z.array(z.object({ school: z.string(), program: z.string(), years: z.string() })),
  skills: z.record(z.string(), z.array(z.string())),
})
export type Resume = z.infer<typeof Resume>

export const Project = z.object({
  title: z.string(),
  slug: z.string(),
  summary: z.string().max(280),
  tech: z.array(z.string()),
  repo: z.string().url().optional(),
  url: z.string().url().optional(),
  hero: z.string().optional(),
  order: z.number().default(0),
})
export type Project = z.infer<typeof Project>
```

- [ ] **Step 2: Placeholder MDX (real content lands in Plan 2)**

`content/profile.mdx`:
```mdx
---
name: Nate O'Farrell
tagline: Director of Infrastructure & Platform Engineering
location: Tewksbury, MA
email: nate@nateofarrell.com
links:
  - label: GitHub
    url: https://github.com/cfsnate
  - label: LinkedIn
    url: https://www.linkedin.com/in/nateofarrell/
---

Placeholder profile — full content lands in Plan 2.
```

`content/resume.mdx`:
```mdx
---
summary: 15+ years architecting distributed systems and delivering production-critical infrastructure.
experience: []
certifications: []
education: []
skills: {}
---

Placeholder — full resume lands in Plan 2.
```

`content/projects/_index.mdx`:
```mdx
---
title: Projects
---

Listing populated in Plan 2.
```

`content/links.mdx`:
```mdx
---
bookmarks:
  - label: GitHub
    url: https://github.com/cfsnate
---
```

- [ ] **Step 3: Check script**

`scripts/check-content.ts`:
```ts
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { Profile, Resume } from '../lib/content/schema'

const ROOT = join(process.cwd(), 'content')

function load(file: string) {
  const raw = readFileSync(join(ROOT, file), 'utf8')
  return matter(raw).data
}

let failed = 0

if (existsSync(join(ROOT, 'profile.mdx'))) {
  const r = Profile.safeParse(load('profile.mdx'))
  if (!r.success) { console.error('profile.mdx invalid:', r.error.format()); failed++ }
}

if (existsSync(join(ROOT, 'resume.mdx'))) {
  const r = Resume.safeParse(load('resume.mdx'))
  if (!r.success) { console.error('resume.mdx invalid:', r.error.format()); failed++ }
}

console.log(failed === 0 ? '✓ content valid' : `✗ ${failed} content file(s) invalid`)
process.exit(failed === 0 ? 0 : 1)
```

- [ ] **Step 4: Run check**

```bash
bun add -D gray-matter
bun run check:content
```

Expected: `✓ content valid`.

- [ ] **Step 5: Commit**

```bash
git add lib/content/schema.ts content/ scripts/check-content.ts package.json
git commit -m "feat: Zod content schemas + placeholder MDX + check:content script"
```

---

### Task 21: API stubs (messages, chat) returning 501

**Files:**
- Create: `app/api/messages/route.ts`, `app/api/chat/route.ts`

- [ ] **Step 1: Messages stub**

`app/api/messages/route.ts`:
```ts
import { NextResponse } from 'next/server'
export async function POST() {
  return NextResponse.json({ error: 'Not implemented (Plan 2)' }, { status: 501 })
}
```

- [ ] **Step 2: Chat stub**

`app/api/chat/route.ts`:
```ts
import { NextResponse } from 'next/server'
export async function POST() {
  return NextResponse.json({ error: 'AI chat not enabled' }, { status: 501 })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/
git commit -m "feat: API stubs for messages + chat (501 until wired)"
```

---

### Task 22: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Workflow**

`.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push: { branches: [main] }
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with: { bun-version: 1.x }

      - name: Install deps
        run: bun install --frozen-lockfile

      - name: Lint
        run: bun run lint

      - name: Typecheck
        run: bun run typecheck

      - name: Content schema
        run: bun run check:content

      - name: Tests
        run: bun run test

      - name: Build
        run: bun run build
```

- [ ] **Step 2: Push and verify CI**

```bash
git add .github/
git commit -m "ci: lint + typecheck + content + tests + build on PR/push"
git push origin main   # or push branch + open PR
```

Expected: CI runs and passes within ~3 minutes. If lint/typecheck fail, fix before merging.

---

### Task 23: Vercel deploy + nate.cx cutover prep

**Files:** none new. This is an environmental task.

- [ ] **Step 1: Connect repo to Vercel**

In Vercel dashboard: New Project → Import `cfsnate/portfolio`.
Framework: Next.js (auto-detected).
Build command: `bun run build` (override default `next build` if needed).
Install command: `bun install --frozen-lockfile`.
Output dir: `.next` (default).

- [ ] **Step 2: Set env vars in Vercel**

Production:
- `RESEND_API_KEY` = (Plan 2 — leave blank for now or dummy)
- `GITHUB_TOKEN` = (optional — not used until widgets wire)

- [ ] **Step 3: Deploy preview**

Push a branch; Vercel auto-deploys. Open the preview URL. Verify:
- `/` → boot → Terminal opens
- Click each dock icon → Coming Soon window opens
- `/resume` → Coming Soon "Resume" window opens directly (no boot)
- Drag windows; close/min/max work
- Wallpaper visible (or fallback gradient)

- [ ] **Step 4: Add nate.cx domain (only when ready to cut over)**

In Vercel project: Settings → Domains → add `nate.cx`. Vercel shows DNS records to update at registrar.
**Do not switch DNS until satisfied with preview.**

When ready: update DNS A/CNAME at the registrar per Vercel's instructions. Old Next.js site remains accessible until DNS propagates.

- [ ] **Step 5: Production smoke test post-cutover**

After DNS propagates:
- Visit https://nate.cx/ — boot → desktop → Terminal default.
- https://nate.cx/resume — opens directly.
- Mobile (phone): currently shows desktop layout (mobile bottom-tab is Plan 3).

- [ ] **Step 6: Commit any final tweaks + tag**

```bash
git tag -a foundation-v0 -m "NateOS foundation deployed"
git push origin foundation-v0
```

---

## Self-review

**Spec coverage check** vs `2026-05-03-nateos-portfolio-design.md`:

| Spec section | Plan task |
|--------------|-----------|
| §4 Architecture | T5–T13 |
| §5 App Registry | T5, T6 |
| §6 Window manager + deeplinks | T7, T11, T12, T16 |
| §6.2 Boot + Terminal default | T14, T19 |
| §6.3 Deeplink scheme | T15, T16 |
| §7 Visual design (Tahoe chrome) | T8–T13 |
| §7.4 Apple asset extraction | T4 |
| §8 App-by-app scope (stubs only — content in Plan 2) | T6 |
| §9 Content model | T20 |
| §10 Toolchain + repo layout | T1–T3 |
| §11 Build + deploy | T22, T23 |
| §12 Testing (minimal) | T7, T18, T22 |
| §13 Observability | (Vercel default; no plan task needed) |
| §14 Error handling | (App error boundaries land in Plan 2 with content) |
| §17 Accessibility | partial — keyboard shortcuts deferred to Plan 3 polish |

**Gaps deliberately deferred:**
- Resume PDF generation (T22 spec) → Plan 2 (lives with real resume content).
- QR vCard widget on desktop → Plan 2 (after profile.mdx has real email).
- Real Resend send → Plan 2 (when Messages app gets full UI).
- Mobile bottom-tab → Plan 3.
- Retro skin → Plan 3.
- Easter eggs → Plan 3.

**Placeholder scan:** ran on this doc. The phrase "Coming Soon" appears intentionally as the v1 stub component label, not as a TODO. No "TBD/FIXME" found. Test code blocks include actual assertions.

**Type consistency:** `AppManifest`, `WindowState`, `CommandContext` defined once (T5, T7, T18) and referenced consistently. `byId` and `byRoute` registries match the manifest shape.

---

## Execution handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-03-nateos-foundation.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best for ~23-task plans with mostly mechanical work.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
