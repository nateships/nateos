# NateOS

A macOS-styled personal portfolio site at [nate.cx](https://nate.cx). Boot screen, draggable
windows, dock, menubar with real-system battery/network state, working terminal, deeplinkable
apps. Built as a credible "this is how I architect" signal as much as a resume site.

## What's inside

- **App registry pattern.** Each app under `apps/<id>/` declares a manifest. The OS shell never
  imports app code — it reads from the registry and mounts components into windows. Drop a folder
  + manifest = new app appears in dock, Spotlight, deeplinks.
- **Real macOS chrome.** Apple icons, wallpapers, and SF fonts extracted from the dev machine.
  File-type icons rendered via `NSWorkspace.icon(forFileType:)`.
- **Window manager.** Drag, resize (3 edges), traffic-light close/minimize/maximize, focus +
  z-index, multi-instance, deeplink-driven open state, minimize-preserves-state.
- **Apps:** Resume (+ PDF + DOCX download), Projects (case studies w/ MDX bodies), Terminal
  (custom shell w/ tab-complete + history), Messages (iMessage UI → Resend backend), Safari
  (favorites tile grid w/ YouTube embeds + GitHub API + OG previews), Finder (virtual filesystem),
  Settings (appearance + wallpaper picker), Calendar (Cal.com embed), Calculator (Konami →
  Snake easter egg).
- **Mobile.** At <768px switches to a single-window bottom-tab UI; same registry, different
  chrome.
- **Easter eggs.** Konami code → About This Mac. Cmd+Opt+Esc → Force Quit dialog. `sudo hire-me`
  in Terminal opens Messages.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Bun · Zustand · Zod · Biome · Vitest · MDX ·
Resend · `@next/mdx` · deployed on Vercel.

## Local dev

```bash
bun install
bun run dev
# open http://localhost:3000
```

The first `bun run dev` calls `gen:data` + `build:vcard` to generate JSON content + vCard QR.
Resume PDF + DOCX live in `public/` (committed).

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

## Apple assets

Icons + wallpapers + SF fonts are extracted from the local macOS install via
`scripts/extract-apple-assets.sh`. Apple's copyright; accepted risk for a personal portfolio.
If you fork this for your own portfolio, replace `public/apple/` with your own.

## Architecture

Full design + implementation plans in [`docs/superpowers/`](./docs/superpowers/):

- `specs/2026-05-03-nateos-portfolio-design.md` — design spec
- `plans/2026-05-03-nateos-foundation.md` — Plan 1: foundation (OS shell, registry, Terminal)
- `plans/2026-05-04-nateos-app-content.md` — Plan 2: real app content
- `plans/2026-05-04-nateos-mobile-retro-eggs.md` — Plan 3: mobile + easter eggs
- `DEPLOY.md` — Vercel + Resend + DNS cutover

## Status

Feature-complete on the `feature/foundation` branch. Will go open-source after the initial
launch.

## License

TBD before going public. Likely MIT for code; Apple assets in `public/apple/` are not part of
the license.
