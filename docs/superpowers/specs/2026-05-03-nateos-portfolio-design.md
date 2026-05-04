# NateOS — Design Spec

**Author:** Nate O'Farrell
**Date:** 2026-05-03
**Status:** Draft, ready for implementation planning
**Repo:** github.com/cfsnate/portfolio
**Deploy target:** nate.cx (replaces existing Next.js site)

---

## 1. Overview

NateOS is a macOS-themed personal portfolio at nate.cx. It serves as resume, project showcase, and contact surface for a mixed audience of Director-level hiring managers and Principal/Staff IC opportunities, anchored on a "hands-on builder" narrative.

Differentiation versus the dozens of existing macOS-clone portfolios on GitHub comes from architectural extensibility (app registry pattern), URL-driven deeplinks for shareable resume links, a working in-browser Terminal as the default surface, a discoverable retro-era easter egg, and a real iMessage-style contact app. AI integration is descoped from v1 but the architecture leaves explicit hooks to add it later.

---

## 2. Goals and non-goals

### Goals

- A polished macOS-Tahoe-style desktop UI that loads at nate.cx with a quick boot animation and Terminal opened by default.
- Direct deeplinks (`/resume`, `/projects/idea`, etc.) that open the matching app pre-loaded; SSR-rendered for SEO and graceful no-JS degradation.
- A plugin-style App Registry so adding a new app later (e.g. AI Chat) requires only dropping a folder, not editing the OS shell.
- A working contact form ("Messages") that delivers email to nate@nateofarrell.com via Resend.
- A QR-vCard widget on the desktop so a recruiter can scan with their phone and save the contact instantly.
- A simplified mobile experience: bottom-tab single-window mode (no springboard, no sheets) that preserves brand and deeplinks without doubling design surface.
- Real Apple icons and wallpapers extracted from the local macOS dev machine, accepting the copyright/takedown risk.
- Replaces the current Next.js site at nate.cx without losing the domain or breaking external links.

### Non-goals (v1)

- Runtime LLM integration (Spotlight RAG, Messages chatbot, etc.) — descoped, but architecture leaves hooks.
- iOS-sibling springboard mobile experience — descoped to v2; v1 ships bottom-tab mobile.
- Live data widgets (GitHub contributions, Datadog uptime, weather) — descoped to v2; widget protocol stub only.
- Real Mission Control / Spaces / Stage Manager — descoped.
- Login/persona screen — descoped.
- WebContainers/Pyodide-backed Terminal that runs real shell commands — v1 Terminal is a custom in-browser shell with a static command set.
- CMS or external content service — content lives as MDX in the repo.

---

## 3. Audience and primary use cases

| Audience | Primary entry point | Primary action |
|----------|--------------------|----------------|
| Senior hiring manager / VP Eng | `nate.cx/resume` (deeplinked from outreach) | Skim resume, scroll/scan experience, download PDF |
| Engineering peer / recruiter scanning many | `nate.cx/` (organic) | Boot → Terminal → `open projects` or `about` |
| Friend / colleague link share | `nate.cx/projects/idea`, `/projects/sleepbar` | Read project deep-dive |
| Anyone wanting to contact | Any page → Messages app | Send message via threaded UI; lands in inbox |

The site must be readable and usable on phones (≥320px) for recruiters opening links from email.

---

## 4. Architecture

### 4.1 Layered model

```
┌─────────────────────────────────────────────────────────────┐
│ Edge — Vercel                                               │
│   Next.js 16.2.4 App Router · RSC + static + edge fns       │
│   Vercel Web Analytics + Speed Insights                     │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ OS Shell (client tree, hydrates over SSR'd content)         │
│   <DesktopShell>: Menubar, Wallpaper, Dock, WindowLayer     │
│   Zustand stores: windows, focus/z, theme/era, deeplink     │
│   Shell never imports app code — reads registry only.       │
└───────────────────────────┬─────────────────────────────────┘
                            ↓ reads
┌─────────────────────────────────────────────────────────────┐
│ App Registry (the spine)                                    │
│   apps/<id>/manifest.ts → AppManifest                       │
│   v1 apps: profile, resume, projects, terminal, messages,   │
│            safari, finder, settings, calendar, textedit,    │
│            calculator                                       │
│   Future apps: drop folder + manifest, no shell edits.      │
└──────────────┬───────────────────────────┬──────────────────┘
               ↓                           ↓
┌─────────────────────────────┐ ┌──────────────────────────────┐
│ Content plane               │ │ Side effects                 │
│ /content/*.mdx              │ │ Resend (Messages)            │
│ resume.mdx, projects/, etc. │ │ QR vCard (build-time)        │
│ Zod-validated, RSC-loaded   │ │ GitHub API (cached, parked)  │
│                             │ │ Future: AI proxy (501 stub)  │
└─────────────────────────────┘ └──────────────────────────────┘

                    ↑ deeplinks ↑
┌─────────────────────────────────────────────────────────────┐
│ Routing & Deeplinks                                         │
│   / → boot → desktop w/ Terminal open                       │
│   /resume → Resume window pre-opened, focused, SSR'd        │
│   /projects/idea → Projects window, deeplinked to IDEA      │
│   /?open=resume,terminal → multi-window                     │
└─────────────────────────────────────────────────────────────┘

                    ↓ alt platform ↓
┌─────────────────────────────────────────────────────────────┐
│ Mobile (<768px) — bottom-tab single-window mode             │
│   Same registry. Apps render in <MobileTabPanel>            │
│   Tabs: About / Resume / Projects / Contact / Terminal      │
│   Deeplinks auto-select tab. iOS sibling = v2.              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Approach selected

Approach 3 from brainstorming: **App registry + route-driven content**. Each app owns a manifest declaring its identity, icon, route, default size, and capabilities. Each app exposes a primary route for SEO and deeplinks. Window state lives in a client store (Zustand). Adding apps later = drop folder + manifest, no shell edits.

This was selected over the simpler "shell imports apps" pattern because extensibility was an explicit user requirement, and the registry pattern doubles as a credible "this is how I architect" signal that aligns with the user's Director-of-Platform-Eng narrative.

---

## 5. App Registry contract

Each app under `apps/<id>/` declares a manifest:

```ts
// apps/resume/manifest.ts
import type { AppManifest } from '@/lib/os/types'
import { ResumeApp } from './app'
import { ResumeIcon } from './icon'

export const manifest = {
  id: 'resume',
  title: 'Resume',
  icon: ResumeIcon,
  route: '/resume',
  component: ResumeApp,
  defaultSize: { w: 900, h: 640 },
  minSize: { w: 480, h: 360 },
  capabilities: ['fullscreen', 'resize', 'minimize'],
  surfaces: ['dock', 'launchpad', 'spotlight'],
  category: 'core',
  badge: () => null,
  schema: {
    section: { type: 'string', optional: true },
  },
} satisfies AppManifest
```

Registry barrel:

```ts
// lib/os/registry.ts
import { manifest as resume } from '@/apps/resume/manifest'
// ...one line per app

export const registry = [resume, projects, terminal, /*...*/] as const
export const byId = Object.fromEntries(registry.map((a) => [a.id, a]))
```

Window state references apps by `id`, never by import:

```ts
// lib/os/window-store.ts
type WindowState = {
  id: string                  // window instance uuid
  appId: keyof typeof byId
  position: { x: number; y: number }
  size: { w: number; h: number }
  state: 'normal' | 'min' | 'max' | 'fullscreen'
  z: number
  params?: Record<string, unknown>
}
```

**Capabilities** flag future-proofs OS features (`multi-instance`, `persists-state`, `requires-network`).

**Adding an app later** is the sole extensibility test: create `apps/<id>/` with `manifest.ts`, `app.tsx`, `icon.tsx`; add one line to `registry`. Shell, Dock, Launchpad, Spotlight, Deeplinks pick it up automatically.

---

## 6. Window manager and deeplinks

### 6.1 Window store operations

All operations are O(1) on a Zustand store:

```ts
openApp(appId, params?)               // create window from manifest defaults
closeWindow(windowId)
focusWindow(windowId)                 // bumps z, updates URL
moveWindow(windowId, { x, y })
resizeWindow(windowId, { w, h })
setWindowState('min' | 'max' | 'normal' | 'fullscreen')
```

The store is the single source of truth. Shell renders the `windows` array in z order. `<Window>` is controlled — it receives state and calls store mutations on user interaction. Z values increment on focus and compact periodically to prevent overflow.

Only the topmost window is "active": its app's menubar is drawn (read from manifest), its keyboard shortcuts win.

### 6.2 Boot and default-app behavior

- `/` → boot screen (Apple logo + progress bar, ~1.2 seconds, skippable on click) → desktop with **Terminal app open by default**, focused.
- Terminal welcome banner: ASCII NateOS logo + brief help text (`type 'help' for commands · 'open <app>' to launch · 'about' for tldr`).
- Boot screen shown once per browser session (`sessionStorage.nateos_booted`). Refresh in same tab skips the boot animation.
- **Direct deeplinks (`/resume`, `/projects/idea`) skip boot entirely.** A recruiter clicking a resume link lands on the resume immediately, with no animation tax.
- "Restart" item in the Apple menu clears the session flag; the next navigation replays boot.

### 6.3 Deeplink scheme

| URL | Behavior |
|-----|----------|
| `/` | Boot animation → empty desktop, Terminal opens by default |
| `/resume` | Skips boot. Opens Resume window centered, focused. SSR-renders ResumeApp content for SEO and no-JS readability |
| `/projects/idea` | Skips boot. Opens Projects window, deeplinks to IDEA detail. Param `?section=idea` |
| `/?open=resume,terminal` | Boots, then opens both; last = focused |
| `/?open=resume&pos=resume:120,80,900,640` | Optional position override (used by "Share this window") |
| `/terminal`, `/messages`, etc. | Each app's primary route opens the matching window |

**SSR + hydration:** each app's route file (`app/resume/page.tsx`) renders MDX content server-side. Crawlers and no-JS users see readable content. Once JS hydrates, the OS shell wraps `{children}` and slots the SSR'd content into a `<Window>`.

**State → URL sync:** debounced (200ms). The "interesting" subset syncs (open list, focused id, deeplink params). Window position and size do **not** sync to URL by default — too noisy. Users can opt-in via "Share this window" menu item which generates a stateful URL with `pos=` parameters.

**Multi-instance** windows are keyed by uuid, not appId. `openApp('textedit', { file: 'a.md' })` and `openApp('textedit', { file: 'b.md' })` produce two windows; the dock shows both with file-name subtitles.

### 6.4 Edge cases

- Reload mid-session → URL hydrates open windows; positions reset to default unless from a shared link.
- Mobile (<768px) ignores window positions entirely; opens the deeplinked app's tab.
- 404 inside an app (e.g. unknown project slug) → app renders an empty state, doesn't 404 the page.
- 404 at route level → opens TextEdit window with `404.mdx` content.

---

## 7. Visual design

### 7.1 Desktop layout (≥768px)

Full Tahoe-era macOS chrome:

- **Menubar:** translucent (backdrop-blur), Apple logo at left, active app's menus, system tray right (search, wifi, battery, clock).
- **Wallpaper:** real Apple wallpaper extracted from `/Library/Desktop Pictures/` (Tahoe default, with picker in Settings).
- **Sparse desktop:** Resume.pdf shortcut icon and a Projects folder icon. Recruiters see resume affordance instantly without opening an app.
- **QR vCard widget** docked top-right: scannable QR encoding `nate.vcf` for one-tap save-contact from a phone.
- **Default Terminal window** centered on first boot, with NateOS ASCII banner + welcome.
- **Dock** bottom: all 11 apps pinned, magnification on hover, running-indicator dot under open apps.

### 7.2 Mobile layout (<768px)

Bottom-tab single-window mode. No OS chrome, no sheets, no springboard.

- Top: simple "NateOS" wordmark and current app title.
- Body: deeplinked app's content rendered into `<MobileTabPanel>` (same component the registry uses on desktop, just in a different container).
- Bottom: tab bar with 5 entries — About / Resume / Projects / Contact / Terminal.
- Deeplink (`nate.cx/resume`) auto-selects the Resume tab.
- iOS-sibling springboard experience deferred to v2.

### 7.3 Era toggle

- **Modern primary** = Tahoe (macOS 26). Liquid-glass surfaces, current SF Pro mirror, full-color icons.
- **Retro = "Classic Mode" easter egg.** Triggered by `theme classic` in Terminal or via Settings > Appearance. Partial skin: boot screen, menubar/window chrome, fonts (Chicago/Charcoal), and Finder swap to System 1 / 7-era styling. Not all apps fully reskinned (TextEdit/Resume keep modern type for readability). High wow per line of code.
- Exit via Apple menu → "Switch to Modern" or `theme tahoe` in Terminal.

### 7.4 Asset strategy

Real Apple artifacts wherever possible. Extraction script (`scripts/extract-apple-assets.sh`) copies from:

- `/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/` — system icons, file-type icons.
- `/System/Applications/<App>.app/Contents/Resources/AppIcon.icns` — per-app icons (Finder, Safari, Calendar, Calculator, Messages, TextEdit, Terminal, System Preferences).
- `/Library/Desktop Pictures/` — wallpapers.
- `/System/Library/Fonts/` — SF Pro family copied into `public/fonts/` (loaded via `next/font`).

Assets committed to `public/apple/` in the public repo. Copyright risk acknowledged and accepted.

---

## 8. App-by-app scope (v1)

| App | Scope (v1) | Out of scope |
|-----|------------|--------------|
| **Profile** | Hero card from `profile.mdx`: photo, tagline, current role, location, social/git links | Real-time status, animated bg |
| **Resume** | Full work history rendered from `resume.mdx`. Sections: Summary, Experience, Projects, Education, Certs, Skills. Sticky section nav. "Download PDF" button (build-time `react-pdf`) | Editable inline, multiple variants |
| **Projects** | Grid of project cards → master/detail layout. IDEA, Sleepbar, re:Invent on launch. Each detail = MDX article + repo/talk links + tech tags | Embedded live demos |
| **Terminal** | Custom shell with command parser. Commands: `help`, `apps`, `open <app>`, `whoami`, `ls`, `cat <file>`, `cd`, `clear`, `theme <era>`, `about`, `contact`, `resume`. Read-only filesystem mapped from `/content/`. History (↑/↓), tab-complete | Real shell, sudo, network |
| **Messages** | iMessage-style threaded UI. Visitor types message → POST `/api/messages` → Resend → nate@. Optional fields: name, email, role-context tag (recruiter / eng / other). Visitor's own thread persists in localStorage so they see history | Real-time replies, inbox view, attachments |
| **Safari** | Embedded "browser" with bookmark bar. Click bookmark → iframe (where allowed) or new tab (where X-Frame blocks). Bookmarks: GitHub profile, IDEA repo, LinkedIn, blog, Sleepbar.app, re:Invent video | Real navigation, history, tabs |
| **Finder** | Sidebar (Recents / Projects / Notes / Photos / Documents) + main pane (icon view). Mirrors `/content/` tree as a virtual filesystem. Double-click MDX → opens in TextEdit | List view, column view |
| **Settings** | Panes: Appearance (light/dark/auto), Wallpaper picker, Era toggle (Tahoe/Classic), Reduce Motion, "About this Mac" → opens dialog with build version + last commit | All other panes |
| **Calendar** | Month view, read-only. Cal.com embed widget. "Book intro chat" CTA → cal.com/nateofarrell/intro | Editable, multi-cal |
| **TextEdit** | Generic markdown viewer. Opens any MDX file from Finder or via deeplink (`/textedit?file=projects/idea.mdx`). Multi-instance | Editing, save, formats |
| **Calculator** | Standard calc UI, basic ops. Konami code on it = swap to Snake easter egg. Real macOS Calculator icon | Scientific/programmer modes |

### 8.1 Easter eggs (v1)

- Konami code anywhere → "About this Mac" dialog with full system info plus a hidden link.
- Right-click menubar Apple → "Restart" replays boot animation.
- Force-quit dialog (Cmd+Opt+Esc) → lists running apps with a gag "(Not Responding)" entry.
- `theme classic` in Terminal → enables retro skin.
- `sudo hire-me` in Terminal → "Permission granted" + opens Messages.

---

## 9. Content model and data flow

### 9.1 Content tree

```
content/
  profile.mdx                   # bio, summary, current role
  resume.mdx                    # source of truth for resume + PDF gen
  projects/
    idea.mdx
    sleepbar.mdx
    reinvent-2022.mdx
    _index.mdx
  notes/                        # parked v1, scaffolded for v2
  links.mdx                     # Safari bookmarks
```

### 9.2 Schema enforcement

`lib/content/schema.ts` defines Zod types per content kind. `bun build:content` validates at build and fails CI on missing fields.

```ts
const Project = z.object({
  title: z.string(),
  slug: z.string(),
  summary: z.string().max(280),
  tech: z.array(z.string()),
  repo: z.string().url().optional(),
  url: z.string().url().optional(),
  hero: z.string().optional(),
  order: z.number().default(0),
})
```

### 9.3 Data flow

| Stage | Surface | Behavior |
|-------|---------|----------|
| Build time | MDX validation, PDF gen | Zod-validated. `react-pdf` produces `public/resume.pdf` |
| Runtime (RSC) | `app/<route>/page.tsx` | Reads MDX frontmatter + content via contentlayer-style barrel |
| Runtime (client) | OS shell | Zustand: window state, focus/z, theme/era, deeplink sync |
| URL sync | `nuqs` | Bidirectional URL ↔ store |

### 9.4 External side effects

All behind `app/api/*` route handlers — rate limit, secrets server-side:

| Surface | Endpoint | Purpose |
|---------|----------|---------|
| Messages app | `POST /api/messages` | Resend send to nate@nateofarrell.com. Honeypot field + rate limit (3/IP/hr). Returns thread-id for "delivered" UX |
| Safari github tile (parked) | `GET /api/github/stats` | GitHub REST cached 6h via `unstable_cache` |
| QR vCard widget | (build-time) | `vcard.vcf` + PNG QR generated in `next.config` build hook |
| Future: AI Chat | `POST /api/chat` (stub, 501) | Reserved route, manifest exists with `disabled: true`, returns "coming soon" |

### 9.5 Secrets

Vercel env vars: `RESEND_API_KEY`, `GITHUB_TOKEN` (read-only). Local `.env.local` gitignored. No secrets in repo.

### 9.6 Caching

- MDX content: SSG (revalidate on push).
- GitHub stats (parked): 6h ISR.
- Messages POST: never cached, edge runtime.
- Static assets (icons, wallpapers): immutable, long Cache-Control.

### 9.7 Extensibility hooks

- **Co-located API:** `apps/<id>/api/*.ts` route handlers — apps can ship their own endpoints.
- **Capabilities flag** on manifest → shell exposes only declared features.
- **Theme system:** CSS variables namespaced per era (`--bg-tahoe`, `--bg-classic`). Adding an era = new CSS file + Settings option.
- **Widget protocol stub:** `WidgetManifest` type defined, `widgets/` folder with a placeholder example. Wire-up deferred.
- **AI chat:** manifest entry exists with `disabled: true`, route returns 501. Flip flag + implement `POST /api/chat` to enable.

---

## 10. Toolchain and repo layout

### 10.1 Stack

- **Bun 1.x** — install + run scripts (`bun install`, `bun dev`, `bun build`).
- **Next.js 16.2.4** — App Router.
- **React 19**.
- **TypeScript** strict.
- **Tailwind v4** — CSS-first config.
- **Inter** via `next/font` (fallback). **SF Pro** copied locally as `.woff2` for desktop-class rendering.
- **Zustand** for client OS state.
- **nuqs** for URL ↔ store sync.
- **Zod** for content schemas + API payloads.
- **MDX** via `@next/mdx` + rehype plugins (Shiki for code highlighting).
- **react-pdf** for resume PDF generation at build time.
- **qrcode** npm for vCard QR.
- **Biome** for lint + format (single tool, fast).
- **Vitest** for the few unit tests.

### 10.2 Repo layout

```
portfolio/
  app/                          # Next.js routes (one per app + root)
  apps/                         # registered apps (manifest + component + icon)
    resume/{manifest.ts, app.tsx, icon.tsx}
    ...
  components/                   # shared UI primitives (Window, Sheet, Dock, Menubar, ...)
  lib/
    os/                         # registry, window store, deeplink sync
    content/                    # MDX loaders, schemas
    api/                        # Resend client, GitHub client (cached)
  content/                      # MDX source of truth
  public/
    apple/                      # extracted Apple icons + wallpapers
    fonts/                      # SF Pro woff2
    vcard.vcf
    qr.png
  scripts/
    extract-apple-assets.sh     # copies from /System/Library/...
    build-pdf.ts                # generates resume.pdf from resume.mdx
  .github/workflows/ci.yml
  bunfig.toml
  next.config.ts
  tailwind.config.ts
  biome.json
```

---

## 11. Build, deploy, CI

- **CI (GitHub Actions, Bun):**
  - Lint (Biome) + format check.
  - Typecheck (`tsc --noEmit`).
  - Content schema validation (`bun run check:content`).
  - 1–2 smoke tests (Vitest): terminal command parser, messages POST happy path (mocked Resend).
  - Build (`bun run build`) — fails CI on broken MDX or PDF generation.
- **Deploy:** Vercel git integration on `main`. PR previews per branch.
- **Domain:** nate.cx already on Vercel; cutover is a redeploy + DNS no-op.

---

## 12. Testing (minimal)

Personal portfolio scope. No coverage targets, no Playwright, no visual regression.

- Lint + typecheck in CI (free, catches dumb breaks).
- Content schema validation prevents shipping broken MDX.
- 1–2 Vitest smoke tests max:
  - Terminal command parser unit test.
  - Messages POST happy path with mocked Resend.
- Manual QA via Vercel preview deploys for visual + interaction work.

---

## 13. Observability

- **Vercel Web Analytics** (page views, route timings) — free, default on.
- **Vercel Speed Insights** (Core Web Vitals) — free, default on.
- **Sentry**: parked. `console.error` only in v1.
- **Resend dashboard** alone for email delivery monitoring.
- No third-party trackers, no cookies.

---

## 14. Error handling

- **App-level error boundary** in `<Window>` — a crashed app shows a native-looking "The application X quit unexpectedly" dialog with "Reopen" and "Report" (mailto:). Other windows unaffected.
- **Global error boundary** in root — full-screen "kernel panic" page (gray-on-black, multilingual restart text). Hold-to-restart easter egg.
- **API errors:** Messages shows iOS-style red "!" delivery-failed indicator with retry. GitHub stats failure → silent fallback to last cached values.
- **404 inside an app:** app's own empty state. **404 at route level:** TextEdit window opens with `404.mdx` content.
- **Terminal:** unknown command → `nateos: command not found: <x>. Type 'help' for available commands.`

---

## 15. Performance budget

- LCP < 1.5s desktop, < 2.5s mobile (Vercel edge).
- JS budget: < 180KB gzipped above-the-fold (boot + Terminal).
- Apps lazy-loaded via dynamic `import()` on first open. Manifest registry stays light (icon + metadata only).
- Wallpapers as AVIF + WebP fallback.
- Apple icons sprite-sheeted where it makes sense.

---

## 16. Security

- All user input zod-parsed at API boundary.
- Honeypot field + simple IP rate-limit on `/api/messages` (Vercel KV or Upstash; final pick at implementation).
- CSP: strict, allow only self + Vercel Analytics + Resend (none client-facing). No inline scripts (Next handles this).
- HTTPS enforced (Vercel default).
- No PII stored client-side except the visitor's own message thread in localStorage.

---

## 17. Accessibility

- Window keyboard nav: Tab cycles dock, Enter opens, Cmd+W closes, Cmd+M minimizes.
- Reduce-motion respected (boot animation skip, dock magnification off).
- All interactive elements have ARIA labels and visible focus rings.
- Terminal is screen-reader friendly via a live region for output.
- Color contrast ≥ WCAG AA on all text.

---

## 18. Risks and open decisions

| Risk / Decision | Owner | Notes |
|-----------------|-------|-------|
| Apple copyright takedown of icons/wallpapers | Nate | Accepted. Will respond to any takedown by swapping for stylized assets via nano-banana. |
| Rate-limit storage choice (Vercel KV vs Upstash) | Nate | Defer to implementation. Either fine for traffic level. |
| Sentry on/off | Nate | Off in v1. Re-evaluate after 30 days of traffic. |
| iOS sibling design fidelity | Nate | v2. Keep mobile bottom-tab placeholder honest (no half-finished iOS UI). |
| Cal.com booking link | Nate | Confirm `cal.com/nateofarrell/intro` exists; fallback = Calendar app links to `mailto:` until set up. |
| Profile photo source | Nate | Provide real photo at implementation; nano-banana avatar acceptable as placeholder only. |

---

## 19. Out of scope, parked for v2+

- iOS-sibling springboard mobile.
- AI features: Spotlight RAG, Messages chatbot, Terminal LLM agent.
- Live data widgets (GitHub graph, weather, Datadog uptime, Sleepbar download counter).
- Mission Control / Spaces.
- Multi-persona login screen.
- WebContainers/Pyodide-backed real Terminal.
- Notes app + blog.
- Photos app.
- Music app.
- Visual regression testing.
- E2E (Playwright) suite.

---

## 20. Acceptance criteria for v1

The implementation is "done" when all of the following are true:

1. `nate.cx/` boots and opens Terminal with welcome banner.
2. `nate.cx/resume` loads directly to a focused Resume window with full content visible (SSR + hydrated).
3. All 11 v1 apps open from the dock, render their content, and close cleanly.
4. Terminal supports the documented command set; tab-complete and history work.
5. Messages app delivers mail to nate@nateofarrell.com via Resend; rate-limit and honeypot active.
6. QR vCard widget shows on desktop and resolves to a saveable contact when scanned.
7. Mobile (<768px) shows bottom-tab UI with all 5 tabs functional and deeplinks routing to correct tab.
8. `theme classic` in Terminal toggles retro skin and persists across reloads.
9. CI passes lint, typecheck, schema validation, and the smoke tests on a clean clone.
10. Vercel preview deploy renders correctly on Safari (macOS), Chrome, Firefox, Mobile Safari, Mobile Chrome.
11. Adding a hypothetical `apps/hello/` with a manifest and component makes it appear in dock and open via `/hello` deeplink with no edits to shell code.

---

*End of spec.*
