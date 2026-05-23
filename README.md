# NateOS

A macOS-styled personal portfolio site at [nate.cx](https://nate.cx). Boot screen, draggable
windows, dock, menubar with real-system battery/network state, working terminal, deeplinkable
apps. Built as a credible "this is how I architect" signal as much as a resume site.

## What's inside

- **App registry pattern.** Each app under `apps/<id>/` declares a manifest. The OS shell never
  imports app code — it reads from the registry and mounts components into windows. Drop a folder
  + manifest = new app appears in dock, Spotlight, deeplinks.
- **Real macOS chrome.** macOS-style icons, wallpapers, and system fonts, with file-type icons
  rendered via `NSWorkspace.icon(forFileType:)`.
- **Window manager.** Drag, resize (3 edges), traffic-light close/minimize/maximize, focus +
  z-index, multi-instance, deeplink-driven open state, minimize-preserves-state.
- **Apps:** Resume (+ PDF + DOCX download), Projects (case studies w/ MDX bodies), Terminal
  (custom shell w/ tab-complete + history + neofetch MOTD), Messages (iMessage UI → Resend
  backend), Safari (favorites tile grid w/ YouTube embeds + GitHub API + OG previews), Finder
  (virtual filesystem w/ real macOS file-type icons), Settings (appearance + wallpaper picker),
  Calendar (Cal.com embed), Calculator.
- **Live system status.** Menubar reads `navigator.getBattery()` and `navigator.connection`
  for real battery + network indicators (where the browser supports them).
- **Mobile.** At <768px switches to a single-window bottom-tab UI; same registry, different
  chrome.

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

NateOS is a personal, non-commercial homage to macOS and is not affiliated with Apple. The
macOS-style icons, wallpapers, and fonts under `public/apple/` are property of their respective
owners and are **not** covered by this repo's license. If you fork this for your own portfolio,
replace `public/apple/` with your own assets.

## Architecture

- App registry: `apps/<id>/manifest.ts` declares each app; `lib/os/registry.ts` is the barrel.
- Window state: Zustand store at `lib/os/window-store.ts` (open/close/focus/move/resize +
  multi-instance + persisted-on-minimize).
- Routing: each app has a route under `app/<id>/`; deeplinks open the matching window via
  `components/deeplink/DeeplinkRouter.tsx`.
- Content: MDX in `content/`, validated by Zod schemas at build, surfaced as JSON via
  `scripts/generate-data.ts` (Turbopack rejects `node:fs` in client component import chains).

## Status

Live at [nate.cx](https://nate.cx). This is a personal portfolio — feel free to read and learn
from the code, but PRs aren't accepted. Issues and questions are welcome.

## License

Original source code is [MIT](./LICENSE). The macOS-style assets in `public/apple/` are **not**
covered by it — see the Apple assets section above.
