# NateOS — Plan 2: App Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every "Coming Soon" stub with a working app: Profile, Resume (+ PDF), Projects (IDEA, Sleepbar, re:Invent 2022), Messages (Resend), Safari, Finder, Settings, Calendar, TextEdit, Calculator (+ Snake easter egg), and the QR vCard desktop widget. Real content drawn from `Nate_OFarrell_2026.docx`. After this plan, the site is recruiter-usable end-to-end on desktop.

**Architecture:** Each app's `app.tsx` becomes a real component reading from `/content/*.mdx` via the existing Zod schemas. New schemas added for projects + links. Resume PDF generated at build via `@react-pdf/renderer` (already installed). Messages POST hits `/api/messages` which calls Resend. QR + vCard generated at build via `qrcode` (already installed) into `public/`. Terminal `cat` wired to real content. Window-body bg already removed in Plan 1, so apps own their visuals.

**Tech Stack:** Next.js 16.2.4 · React 19 · Bun · Tailwind v4 · Zustand · Zod · @next/mdx · @react-pdf/renderer · resend · qrcode · gray-matter.

**Branch:** continue on `feature/foundation` (or fork `feature/app-content` if user prefers — controller decides at start). The repo already has all dependencies installed.

---

## File Structure (created/modified in this plan)

```
portfolio/
  apps/
    profile/app.tsx                   # rewritten — real bio
    resume/app.tsx                    # rewritten — full resume render
    resume/Pdf.tsx                    # NEW — react-pdf document
    projects/app.tsx                  # rewritten — master/detail listing
    projects/ProjectCard.tsx          # NEW
    projects/ProjectDetail.tsx        # NEW
    messages/app.tsx                  # rewritten — iMessage UI
    messages/types.ts                 # NEW
    safari/app.tsx                    # rewritten — bookmark bar + iframe
    safari/Bookmarks.tsx              # NEW
    finder/app.tsx                    # rewritten — sidebar + icon view
    finder/vfs.ts                     # NEW — virtual filesystem
    settings/app.tsx                  # rewritten — Appearance + Wallpaper panes
    settings/AppearancePane.tsx       # NEW
    settings/WallpaperPane.tsx        # NEW
    calendar/app.tsx                  # rewritten — Cal.com embed
    textedit/app.tsx                  # rewritten — MDX viewer
    calculator/app.tsx                # rewritten — calc engine
    calculator/Snake.tsx              # NEW — easter egg
    calculator/engine.ts              # NEW — eval logic
    calculator/engine.test.ts         # NEW — tests
  components/
    desktop/
      DesktopWidgets.tsx              # NEW — QR vCard widget
      QrVCard.tsx                     # NEW
      DesktopIcons.tsx                # NEW — Resume.pdf shortcut + Projects folder
  content/
    profile.mdx                       # rewritten — real bio
    resume.mdx                        # rewritten — full work history
    projects/idea.mdx                 # rewritten
    projects/sleepbar.mdx             # rewritten
    projects/reinvent-2022.mdx        # NEW
    projects/_index.mdx               # rewritten
    links.mdx                         # rewritten — real bookmarks
  lib/
    content/
      load.ts                         # NEW — typed MDX loader (replaces inline parse)
      schema.ts                       # MODIFIED — add Project listing helper, Bookmarks
    pdf/
      build-resume-pdf.ts             # NEW — build-time PDF generator
    settings/
      store.ts                        # NEW — appearance/wallpaper Zustand store
  app/
    api/
      messages/route.ts               # rewritten — Resend POST
  apps/terminal/commands.ts           # MODIFIED — `cat` reads real content
  apps/terminal/commands.test.ts      # MODIFIED — `cat` tests
  components/os/Wallpaper.tsx         # MODIFIED — read from settings store
  components/os/DesktopShell.tsx      # MODIFIED — mount DesktopWidgets + DesktopIcons
  scripts/
    build-vcard.ts                    # NEW — generates public/contact.vcf + public/qr.png
  package.json                        # MODIFIED — postbuild scripts
  public/
    contact.vcf                       # generated
    qr.png                            # generated
    resume.pdf                        # generated
```

---

### Task 1: Update content schemas + add typed MDX loader

**Files:**
- Modify: `lib/content/schema.ts`
- Create: `lib/content/load.ts`, `lib/content/load.test.ts`

- [ ] **Step 1: Extend schema.ts**

`lib/content/schema.ts` (full replacement):
```ts
import { z } from 'zod'

export const Profile = z.object({
  name: z.string(),
  tagline: z.string(),
  location: z.string(),
  email: z.email(),
  phone: z.string().optional(),
  links: z.array(z.object({ label: z.string(), url: z.url() })),
  bio: z.string(),
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
export type ResumeRole = z.infer<typeof ResumeRole>

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
  repo: z.url().optional(),
  url: z.url().optional(),
  hero: z.string().optional(),
  order: z.number().default(0),
})
export type Project = z.infer<typeof Project>

export const Bookmark = z.object({
  label: z.string(),
  url: z.url(),
  category: z.enum(['social', 'code', 'media', 'other']).default('other'),
})
export type Bookmark = z.infer<typeof Bookmark>

export const Links = z.object({
  bookmarks: z.array(Bookmark),
})
export type Links = z.infer<typeof Links>
```

- [ ] **Step 2: Write loader tests**

`lib/content/load.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { loadProfile, loadProjects, loadResume } from './load'

describe('content loaders', () => {
  it('loadProfile returns a parsed Profile', () => {
    const p = loadProfile()
    expect(p.name).toBeDefined()
    expect(p.email).toMatch(/@/)
  })
  it('loadResume returns a parsed Resume', () => {
    const r = loadResume()
    expect(r.summary).toBeDefined()
    expect(Array.isArray(r.experience)).toBe(true)
  })
  it('loadProjects returns a sorted array of Project', () => {
    const ps = loadProjects()
    expect(Array.isArray(ps)).toBe(true)
    if (ps.length > 1) {
      for (let i = 1; i < ps.length; i++) {
        expect(ps[i].order).toBeGreaterThanOrEqual(ps[i - 1].order)
      }
    }
  })
})
```

- [ ] **Step 3: Implement loader**

`lib/content/load.ts`:
```ts
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { type Links, Profile, type Project, Project as ProjectSchema, Resume } from './schema'

const ROOT = join(process.cwd(), 'content')

function readFront<T>(file: string): T {
  const raw = readFileSync(join(ROOT, file), 'utf8')
  return matter(raw).data as T
}

export function loadProfile() {
  return Profile.parse(readFront('profile.mdx'))
}

export function loadResume() {
  return Resume.parse(readFront('resume.mdx'))
}

export function loadProjects(): Project[] {
  const dir = join(ROOT, 'projects')
  const files = readdirSync(dir).filter((f) => f.endsWith('.mdx') && !f.startsWith('_'))
  const items = files.map((f) => ProjectSchema.parse(readFront(`projects/${f}`)))
  return items.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

export function loadLinks(): Links['bookmarks'] {
  const raw = readFront('links.mdx') as { bookmarks?: Links['bookmarks'] }
  return raw.bookmarks ?? []
}
```

- [ ] **Step 4: Run typecheck**

Run: `bun run typecheck`
Expected: clean.

- [ ] **Step 5: Run tests (will fail until content exists)**

Run: `bun run test lib/content/load.test.ts -t "load"`
Expected: failures because `profile.mdx` doesn't have `bio` yet (added in Task 2). Note this; we'll re-run after Task 2.

- [ ] **Step 6: Commit**

```bash
git add lib/content/schema.ts lib/content/load.ts lib/content/load.test.ts
git commit -m "feat(content): typed MDX loaders + extended schemas"
```

---

### Task 2: Real profile.mdx content

**Files:**
- Modify: `content/profile.mdx`

- [ ] **Step 1: Write real frontmatter**

Replace `content/profile.mdx`:
```mdx
---
name: Nate O'Farrell
tagline: Director of Infrastructure & Platform Engineering
location: Tewksbury, MA
email: nate@nateofarrell.com
phone: +1 (781) 888 2277
links:
  - label: GitHub
    url: https://github.com/cfsnate
  - label: LinkedIn
    url: https://www.linkedin.com/in/nateofarrell/
  - label: re:Invent 2022 (MFG 205)
    url: https://www.youtube.com/watch?v=vrA-KiYXTug
  - label: Sleepbar
    url: https://sleepbar.app
  - label: IDEA HPC Platform
    url: https://github.com/cfs-energy/idea
bio: |
  Director of Infrastructure & Platform Engineering operating at the depth of a Principal Engineer.
  15+ years architecting distributed systems across cloud, on-prem, and hybrid environments;
  scaled organizations from 200 to 1,500+ users. Currently leading IT, OT, and Platform Engineering
  at Commonwealth Fusion Systems through 1,900% growth, owning an $8M infrastructure P&L spanning
  cloud, on-prem, and HPC across research, manufacturing, and enterprise. Built the infrastructure
  organization from one engineer to a ten-person team; equally comfortable in the architecture
  review and on the keyboard.
---

Open to Principal/Staff IC and Director-level roles where infrastructure shapes product, the
architecture problems are non-trivial, and the same person can own the architecture end-to-end —
from strategy and design through hands-on implementation.
```

- [ ] **Step 2: Validate**

Run: `bun run check:content`
Expected: `✓ content valid`.

- [ ] **Step 3: Run loader tests**

Run: `bun run test lib/content/load.test.ts -t "loadProfile"`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add content/profile.mdx
git commit -m "content: real profile.mdx (bio, contact, links)"
```

---

### Task 3: Profile app

**Files:**
- Modify: `apps/profile/app.tsx`

- [ ] **Step 1: Replace stub**

`apps/profile/app.tsx`:
```tsx
import { loadProfile } from '@/lib/content/load'
import { ProfileIcon } from './icon'

export function ProfileApp() {
  const p = loadProfile()
  return (
    <div className="h-full w-full overflow-auto os-scroll bg-zinc-900/85 text-white">
      <div className="px-8 py-7 flex flex-col gap-6 max-w-2xl mx-auto">
        <header className="flex items-center gap-5">
          <ProfileIcon size={72} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{p.name}</h1>
            <p className="text-sm opacity-80 mt-1">{p.tagline}</p>
            <p className="text-xs opacity-60 mt-1">{p.location}</p>
          </div>
        </header>

        <section className="text-[14px] leading-relaxed opacity-90 whitespace-pre-line">
          {p.bio}
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-wider opacity-60 mb-2">Contact</h2>
          <div className="flex flex-col gap-1 text-sm">
            <a className="text-blue-400 hover:underline" href={`mailto:${p.email}`}>
              {p.email}
            </a>
            {p.phone ? <span className="opacity-80">{p.phone}</span> : null}
          </div>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-wider opacity-60 mb-2">Links</h2>
          <ul className="flex flex-col gap-1.5 text-sm">
            {p.links.map((l) => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
```

`apps/profile/app.tsx` is now a Server Component (no `'use client'`) — it reads from the filesystem at build/render time. The OS shell is `'use client'` and mounts this component as a child; React 19 supports server components inside client trees via the `import` boundary.

If TypeScript or runtime complains about server/client mixing, prepend `'use client'` and switch `loadProfile()` to fetch from a static JSON file generated at build. **Try without `'use client'` first** — the simpler case.

- [ ] **Step 2: Verify build**

Run: `bun run build`
Expected: clean. If it fails because `loadProfile()` uses `node:fs` in a client component, add `'use client'` to `apps/profile/app.tsx` and:
- Move `loadProfile()` call to a static `app/profile/data.ts`:
  ```ts
  import { loadProfile } from '@/lib/content/load'
  export const profileData = loadProfile()
  ```
- Import `profileData` in `apps/profile/app.tsx` instead of calling `loadProfile()` directly.

This works because static imports are evaluated at module load, which Next bundles as build-time-resolved JSON.

- [ ] **Step 3: Smoke test**

```bash
bun run dev &
sleep 3
curl -s http://localhost:3000/profile | grep -q "Nate O" && echo "OK profile"
kill %1
```

- [ ] **Step 4: Commit**

```bash
git add apps/profile/app.tsx app/profile/data.ts 2>/dev/null
git commit -m "feat(profile): real profile app rendering profile.mdx"
```

---

### Task 4: Real resume.mdx content

**Files:**
- Modify: `content/resume.mdx`

- [ ] **Step 1: Replace with full resume**

`content/resume.mdx`:
```mdx
---
summary: |
  15+ years architecting distributed systems and delivering production-critical infrastructure
  across cloud, on-prem, and hybrid environments. Currently leading IT, OT, and Platform
  Engineering at Commonwealth Fusion Systems through 1,900% growth, owning an $8M infrastructure
  P&L spanning cloud, on-prem, and HPC across research, manufacturing, and enterprise.
experience:
  - company: Commonwealth Fusion Systems
    title: Director of Infrastructure, OT & Platform Engineering
    start: Jun 2023
    end: Present
    location: Devens, MA
    bullets:
      - "Lead a unified IT, OT, and Platform Engineering organization — a scope normally held by three separate directors — covering SRE, DevEx, Cloud, Networking, and OT for 1,500+ employees across research, manufacturing, and enterprise."
      - "Grew the team from 1 to 10 engineers; established hiring plans, on-call rotations, and service catalogs to support 24/7 operations across geographically distributed sites."
      - "Owned an $8M annual IT infrastructure P&L and a $7.5M construction budget, negotiating multi-year vendor contracts and capital plans across the program portfolio."
      - "Directed IT/OT integration for fusion reactor R&D, aligning infrastructure with safety, regulatory, and scientific requirements while accelerating experimental iteration cycles."
      - "Established SRE practices and standardized on Datadog as the unified observability and on-call platform (APM, RUM, Database Monitoring, log management) across 1,000+ VMs, integrated with Prometheus, Grafana, Loki, and Tempo for OSS coverage; cut incident response time by 45% over three years."
      - "Built the Kubernetes platform engineering function around end-to-end GitOps (ArgoCD), Terraform-driven cluster provisioning, and Cilium/eBPF networking, supporting 30+ clusters across EKS, Rancher, BareMetal, and VMware as a self-service platform."
      - "Refactored CFS's proprietary experiment telemetry platform from EC2 to Kubernetes (EKS), sustaining petabyte-scale ingest from fusion experiments without dropping a single data point during cutover."
      - "Designed AWS self-hosted GitHub Actions runner architecture processing 1M+ runs/month, cutting CI spend by $5M/yr vs. GitHub-hosted runners."
      - "Shipped AI/ML across infrastructure and manufacturing: Bedrock-powered internal copilots and computer-vision QC pipelines running on the factory floor."
      - "Drove AI-assisted development adoption across the software engineering org, rolling out Cursor Bugbot for automated PR review at an 83% merge rate."
  - company: Commonwealth Fusion Systems
    title: Head of IT Infrastructure
    start: Sep 2020
    end: Jun 2023
    location: Devens, MA
    bullets:
      - "Built Infrastructure as Code foundation across 50+ AWS accounts and 4 on-prem datacenters with 20+ reusable Terraform modules, Spacelift policies, and GitHub Actions pipelines."
      - "Deployed Infoblox HA DHCP and Anycast DNS across 4 datacenters, eliminating site-local DNS as a single point of failure."
      - "Deployed Amazon EKS clusters with Karpenter for HA, auto-scaling, and zero-downtime workloads with built-in spot/on-demand cost optimization."
      - "Operated on-prem VMware VCF clusters, Pure Storage arrays, and TimescaleDB systems across all sites; 500 VMs handling petabyte-scale data collection and cloud offload, with SR-IOV GPU passthrough for high-performance workloads."
      - "Managed enterprise networking across all CFS sites (SD-WAN, BGP, Fortinet)."
      - "Built HA PKI on Azure App Services supporting SCEP, OCSP, and manual cert issuance/revocation across all endpoints."
      - "Designed cross-site backup and DR architecture covering 4 datacenters and 50+ AWS accounts, with regular restore validation and documented RTO/RPO targets per workload tier."
  - company: Barton Associates
    title: Enterprise Architect, Infrastructure Architecture & Security Manager
    start: Oct 2018
    end: Sep 2020
    location: Peabody, MA
    bullets:
      - "Led infrastructure and security architecture across 10 US sites for a 1,500-person regulated healthcare staffing firm, owning technical strategy, security posture, and final escalation for enterprise infrastructure."
      - "Directed security architecture across physical access, network, vulnerability scanning, and compliance frameworks for the regulated environment."
      - "Drove datacenter migrations, cloud adoption, and platform consolidation across all 10 sites, unifying identity, monitoring, and patching company-wide."
      - "Promoted from Senior Infrastructure Engineer after building the foundation the architecture role was created to scale."
  - company: Barton Associates
    title: Senior Infrastructure Engineer
    start: Oct 2016
    end: Oct 2018
    location: Peabody, MA
    bullets:
      - "Deployed 500+ servers across 10 networks supporting 2,000+ users, including system integrations for every new facility brought online."
      - "Led infrastructure delivery for 10+ nationwide buildouts (office, datacenter, relocations), owning rack/stack, network cutover, and day-one operational readiness."
      - "Coordinated 10+ vendors and contractors across $3M in project value, delivering 100% of projects on time."
      - "Standardized datacenter deployment processes by developing comprehensive documentation and checklists."
certifications:
  - AWS Solutions Architect Professional (2018, 2021)
education:
  - school: Drexel University
    program: Information Technology
    years: 2008–2010
skills:
  Cloud & Platform:
    - AWS (EC2, RDS, S3, Lambda, CloudFront, ECS, EKS, Bedrock)
    - multi-account Organizations
    - CloudFormation
    - CloudWatch
    - GCP / GKE
  Container & Orchestration:
    - Kubernetes (EKS, Rancher)
    - Helm
    - Docker
    - Karpenter
    - Cilium
    - eBPF
  IaC & DevEx:
    - Terraform
    - Ansible
    - Spacelift
    - ArgoCD
    - GitOps
    - GitHub Actions (self-hosted runners at 1M+ runs/month)
  AI/ML:
    - AWS Bedrock
    - computer vision (manufacturing QC)
    - LLM application integration
    - GPU workload orchestration
    - Cursor / Claude Code / Cursor Bugbot
  Networking:
    - SD-WAN
    - BGP
    - Fortinet
    - Juniper
    - MPLS
    - IPSec
    - Infoblox DNS/DHCP
  Data & Storage:
    - petabyte-scale ingest pipelines
    - Pure Storage
    - TimescaleDB
    - PostgreSQL
    - Aurora
    - DynamoDB
    - S3 data lakes
  Virtualization & On-Prem:
    - VMware vSphere/VCF
    - SR-IOV GPU passthrough
    - BareMetal
    - hybrid cloud
  Observability:
    - Datadog
    - Prometheus
    - Grafana
    - Loki
    - Tempo
    - LogicMonitor
    - Elastic Stack
  Identity & Security:
    - Okta
    - LDAP/Active Directory
    - PKI/SCEP/OCSP
    - SIEM
    - Nessus
  Programming:
    - Python
    - Go
    - JavaScript/Node.js
    - Bash
    - PowerShell
---

Selected projects: IDEA HPC Platform (open-source HPC + virtual-desktop platform behind CFS's
fusion design and simulation work), Sleepbar (indie macOS menu-bar app, Swift/SwiftUI),
AWS re:Invent 2022 MFG 205 (co-presented session on cloud HPC for fusion design, 500+ live attendees).
```

- [ ] **Step 2: Validate**

Run: `bun run check:content`
Expected: `✓ content valid`.

- [ ] **Step 3: Loader test**

Run: `bun run test lib/content/load.test.ts`
Expected: 3/3 pass.

- [ ] **Step 4: Commit**

```bash
git add content/resume.mdx
git commit -m "content: real resume.mdx (full work history, skills, certs)"
```

---

### Task 5: Resume app UI

**Files:**
- Modify: `apps/resume/app.tsx`
- Create: `app/resume/data.ts`

- [ ] **Step 1: Static data wrapper**

`app/resume/data.ts`:
```ts
import { loadResume } from '@/lib/content/load'
export const resumeData = loadResume()
```

- [ ] **Step 2: Resume app**

`apps/resume/app.tsx`:
```tsx
'use client'
import { resumeData } from '@/app/resume/data'

export function ResumeApp() {
  const r = resumeData
  return (
    <div className="h-full w-full overflow-auto os-scroll bg-zinc-900/90 text-white">
      <div className="max-w-3xl mx-auto px-8 py-7 flex flex-col gap-7">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Nate O'Farrell</h1>
            <p className="text-sm opacity-80 mt-1">Director of Infrastructure & Platform Engineering</p>
          </div>
          <a
            href="/resume.pdf"
            download="Nate_OFarrell_Resume.pdf"
            className="px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[12px] font-medium"
          >
            Download PDF
          </a>
        </header>

        <section>
          <h2 className="text-[11px] uppercase tracking-wider opacity-60 mb-2">Summary</h2>
          <p className="text-[14px] leading-relaxed opacity-90 whitespace-pre-line">{r.summary}</p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-wider opacity-60 mb-3">Experience</h2>
          <ul className="flex flex-col gap-5">
            {r.experience.map((role) => (
              <li key={`${role.company}-${role.title}-${role.start}`}>
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="text-[15px] font-semibold">{role.title}</h3>
                  <span className="text-[12px] opacity-60">
                    {role.start} – {role.end}
                  </span>
                </div>
                <div className="text-[13px] opacity-80 mb-2">
                  {role.company} · {role.location}
                </div>
                <ul className="list-disc pl-5 flex flex-col gap-1 text-[13px] opacity-90">
                  {role.bullets.map((b, i) => (
                    <li key={`${role.company}-${i}`}>{b}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        {r.certifications.length > 0 ? (
          <section>
            <h2 className="text-[11px] uppercase tracking-wider opacity-60 mb-2">Certifications</h2>
            <ul className="text-[13px] opacity-90 flex flex-col gap-0.5">
              {r.certifications.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <h2 className="text-[11px] uppercase tracking-wider opacity-60 mb-2">Education</h2>
          <ul className="text-[13px] opacity-90 flex flex-col gap-1">
            {r.education.map((e) => (
              <li key={e.school}>
                <span className="font-medium">{e.school}</span>
                <span className="opacity-70"> · {e.program} · {e.years}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-wider opacity-60 mb-2">Skills</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
            {Object.entries(r.skills).map(([k, items]) => (
              <div key={k}>
                <dt className="font-medium mb-0.5">{k}</dt>
                <dd className="opacity-80">{items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `bun run build`
Expected: clean.

- [ ] **Step 4: Smoke**

```bash
bun run dev &
sleep 3
curl -s http://localhost:3000/resume | grep -q "Director of Infrastructure" && echo "OK resume"
kill %1
```

- [ ] **Step 5: Commit**

```bash
git add apps/resume/app.tsx app/resume/data.ts
git commit -m "feat(resume): full resume UI with PDF download button"
```

---

### Task 6: Resume PDF generation at build time

**Files:**
- Create: `apps/resume/Pdf.tsx`, `lib/pdf/build-resume-pdf.ts`, `scripts/build-pdf.ts`
- Modify: `package.json`

- [ ] **Step 1: Define PDF document component**

`apps/resume/Pdf.tsx`:
```tsx
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { Resume } from '@/lib/content/schema'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#111' },
  h1: { fontSize: 18, fontWeight: 'bold' },
  sub: { fontSize: 11, color: '#444', marginBottom: 12 },
  h2: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginTop: 14, marginBottom: 4, color: '#333', letterSpacing: 0.5 },
  role: { marginBottom: 8 },
  roleHead: { flexDirection: 'row', justifyContent: 'space-between' },
  roleTitle: { fontWeight: 'bold', fontSize: 11 },
  roleDates: { fontSize: 9, color: '#666' },
  roleSub: { fontSize: 9, color: '#444', marginBottom: 3 },
  bullet: { flexDirection: 'row', marginBottom: 1, paddingLeft: 8 },
  bulletDot: { width: 8 },
  bulletText: { flex: 1 },
  skillRow: { flexDirection: 'row', marginBottom: 2 },
  skillKey: { width: 120, fontWeight: 'bold' },
  skillVal: { flex: 1 },
})

export function ResumePdf({ resume }: { resume: Resume }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.h1}>Nate O'Farrell</Text>
        <Text style={styles.sub}>Director of Infrastructure & Platform Engineering · Tewksbury, MA · nate@nateofarrell.com</Text>

        <Text style={styles.h2}>Summary</Text>
        <Text>{resume.summary}</Text>

        <Text style={styles.h2}>Experience</Text>
        {resume.experience.map((role) => (
          <View key={`${role.company}-${role.title}-${role.start}`} style={styles.role} wrap={false}>
            <View style={styles.roleHead}>
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleDates}>{role.start} – {role.end}</Text>
            </View>
            <Text style={styles.roleSub}>{role.company} · {role.location}</Text>
            {role.bullets.map((b, i) => (
              <View key={`${role.company}-${i}`} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        ))}

        {resume.certifications.length > 0 ? (
          <>
            <Text style={styles.h2}>Certifications</Text>
            {resume.certifications.map((c) => <Text key={c}>• {c}</Text>)}
          </>
        ) : null}

        <Text style={styles.h2}>Education</Text>
        {resume.education.map((e) => (
          <Text key={e.school}>{e.school} — {e.program} ({e.years})</Text>
        ))}

        <Text style={styles.h2}>Skills</Text>
        {Object.entries(resume.skills).map(([k, items]) => (
          <View key={k} style={styles.skillRow}>
            <Text style={styles.skillKey}>{k}</Text>
            <Text style={styles.skillVal}>{items.join(', ')}</Text>
          </View>
        ))}
      </Page>
    </Document>
  )
}
```

- [ ] **Step 2: Build script**

`scripts/build-pdf.ts`:
```ts
import { renderToFile } from '@react-pdf/renderer'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import React from 'react'
import { ResumePdf } from '../apps/resume/Pdf'
import { loadResume } from '../lib/content/load'

const out = join(process.cwd(), 'public', 'resume.pdf')
mkdirSync(join(process.cwd(), 'public'), { recursive: true })

await renderToFile(React.createElement(ResumePdf, { resume: loadResume() }), out)
console.log('✓ public/resume.pdf')
```

If `renderToFile` is not exported in the installed `@react-pdf/renderer` version, use the `renderToBuffer` API instead and write the buffer:
```ts
import { renderToBuffer } from '@react-pdf/renderer'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import React from 'react'
import { ResumePdf } from '../apps/resume/Pdf'
import { loadResume } from '../lib/content/load'

const out = join(process.cwd(), 'public', 'resume.pdf')
mkdirSync(join(process.cwd(), 'public'), { recursive: true })
const buf = await renderToBuffer(React.createElement(ResumePdf, { resume: loadResume() }))
writeFileSync(out, buf)
console.log('✓ public/resume.pdf')
```

- [ ] **Step 3: Add npm script + prebuild hook**

Edit `package.json` to add:
```json
{
  "scripts": {
    "build:pdf": "bun run scripts/build-pdf.ts",
    "prebuild": "bun run build:pdf"
  }
}
```

(Bun runs `prebuild` automatically before `build` when both are defined as npm scripts.)

- [ ] **Step 4: Run + verify**

```bash
bun run build:pdf
ls -lh public/resume.pdf
```

Expected: file exists, > 5KB.

Open the PDF in a viewer manually and confirm content. If any styling looks broken, tweak `styles` in `apps/resume/Pdf.tsx`.

- [ ] **Step 5: Add public/resume.pdf to .gitignore (built artifact)**

```bash
grep -q '^/public/resume.pdf$' .gitignore || echo '/public/resume.pdf' >> .gitignore
```

(We ship the PDF on every Vercel build via `prebuild`. No need to commit binary.)

- [ ] **Step 6: Run full build**

```bash
bun run build
```

Expected: `prebuild` runs, then `next build`. PDF regenerated. Build clean.

- [ ] **Step 7: Commit**

```bash
git add apps/resume/Pdf.tsx scripts/build-pdf.ts package.json .gitignore
git commit -m "feat(resume): build-time PDF generation via @react-pdf/renderer"
```

---

### Task 7: Project content — IDEA + Sleepbar + re:Invent 2022 + listing copy

**Files:**
- Modify: `content/projects/idea.mdx`, `content/projects/sleepbar.mdx`, `content/projects/_index.mdx`
- Create: `content/projects/reinvent-2022.mdx`

- [ ] **Step 1: idea.mdx**

`content/projects/idea.mdx`:
```mdx
---
title: IDEA HPC Platform
slug: idea
summary: Open-source HPC + virtual-desktop platform behind CFS's fusion design and simulation work. Multi-tenant, scales to 75,000 CPU cores with per-team cost attribution and project-scoped IAM.
tech:
  - AWS
  - HPC
  - Kubernetes
  - Terraform
  - Slurm
  - Python
repo: https://github.com/cfs-energy/idea
order: 1
---

Primary maintainer of IDEA (Integrated Digital Engineering on AWS), the open-source HPC +
virtual-desktop platform behind Commonwealth Fusion Systems' fusion design and simulation work.

- Architected multi-tenant infrastructure scaling to 75,000 CPU cores and multi-GPU MPI workloads
  concurrently, with per-team cost attribution and project-scoped IAM.
- Built spot-fleet auto-scaling and idle-shutdown automation, cutting compute costs 40% vs.
  fixed on-demand provisioning.
```

- [ ] **Step 2: sleepbar.mdx**

`content/projects/sleepbar.mdx`:
```mdx
---
title: Sleepbar
slug: sleepbar
summary: Native macOS 14+ menu-bar app for scheduling sleep at a specific time or after a duration. Built end-to-end in Swift/SwiftUI as a solo indie project outside the day job.
tech:
  - Swift
  - SwiftUI
  - macOS
url: https://sleepbar.app
order: 2
---

Indie macOS app shipped solo, end-to-end: product, design, Swift/SwiftUI implementation, marketing
site, and release pipeline. Polished native app at indie scope.

Lives in the menu bar; lets you schedule sleep at a specific time or after a duration.
```

- [ ] **Step 3: reinvent-2022.mdx**

`content/projects/reinvent-2022.mdx`:
```mdx
---
title: AWS re:Invent 2022 — MFG 205
slug: reinvent-2022
summary: Co-presented session MFG 205 at AWS re:Invent 2022 on cloud HPC for fusion design and simulation. 500+ live attendees, recording on AWS's YouTube channel.
tech:
  - AWS
  - HPC
  - Public Speaking
url: https://www.youtube.com/watch?v=vrA-KiYXTug
order: 3
---

Co-presented at AWS re:Invent 2022 in Las Vegas. Topic: cloud HPC for fusion design and simulation,
based on CFS's IDEA platform. 500+ live attendees; recording is on AWS's YouTube channel.
```

- [ ] **Step 4: _index.mdx**

`content/projects/_index.mdx`:
```mdx
---
title: Projects
intro: A selection of work — open source, indie, and conference talks.
---

Selected projects spanning open-source HPC platforms, indie macOS apps, and AWS re:Invent talks.
```

- [ ] **Step 5: Validate + loader test**

```bash
bun run check:content
bun run test lib/content/load.test.ts
```

Expected: clean + 3/3 pass; `loadProjects()` returns 3 entries sorted by order.

- [ ] **Step 6: Commit**

```bash
git add content/projects/
git commit -m "content: real project pages (IDEA, Sleepbar, re:Invent 2022)"
```

---

### Task 8: Projects app — list + detail

**Files:**
- Create: `apps/projects/ProjectCard.tsx`, `apps/projects/ProjectDetail.tsx`, `app/projects/data.ts`
- Modify: `apps/projects/app.tsx`

- [ ] **Step 1: Static data**

`app/projects/data.ts`:
```ts
import { loadProjects } from '@/lib/content/load'
export const projectsData = loadProjects()
```

- [ ] **Step 2: ProjectCard**

`apps/projects/ProjectCard.tsx`:
```tsx
'use client'
import type { Project } from '@/lib/content/schema'

export function ProjectCard({
  project,
  active,
  onSelect,
}: {
  project: Project
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${
        active ? 'bg-blue-500/80 text-white' : 'hover:bg-white/5'
      }`}
    >
      <div className="text-[13px] font-medium">{project.title}</div>
      <div className="text-[11px] opacity-70 truncate mt-0.5">{project.summary}</div>
    </button>
  )
}
```

- [ ] **Step 3: ProjectDetail**

`apps/projects/ProjectDetail.tsx`:
```tsx
'use client'
import type { Project } from '@/lib/content/schema'

export function ProjectDetail({ project, body }: { project: Project; body: string }) {
  return (
    <article className="px-7 py-6 flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">{project.title}</h1>
        <p className="text-[13px] opacity-80 mt-1">{project.summary}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {project.tech.map((t) => (
            <span
              key={t}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-[12px]">
          {project.repo ? (
            <a className="text-blue-400 hover:underline" href={project.repo} target="_blank" rel="noreferrer">
              Repository ↗
            </a>
          ) : null}
          {project.url ? (
            <a className="text-blue-400 hover:underline" href={project.url} target="_blank" rel="noreferrer">
              Link ↗
            </a>
          ) : null}
        </div>
      </header>
      <section className="text-[13px] leading-relaxed opacity-90 whitespace-pre-line">{body}</section>
    </article>
  )
}
```

- [ ] **Step 4: Wire app — load body MDX text**

Add a loader for project body text in `lib/content/load.ts`:
```ts
import matter from 'gray-matter'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
// ...existing imports

export function loadProjectBody(slug: string): string {
  const raw = readFileSync(join(ROOT, 'projects', `${slug}.mdx`), 'utf8')
  return matter(raw).content.trim()
}
```

Update `app/projects/data.ts`:
```ts
import { loadProjectBody, loadProjects } from '@/lib/content/load'
export const projectsData = loadProjects().map((p) => ({
  ...p,
  body: loadProjectBody(p.slug),
}))
```

(Body is now resolved at build time.)

- [ ] **Step 5: Projects app**

`apps/projects/app.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { projectsData } from '@/app/projects/data'
import type { AppContext } from '@/lib/os/types'
import { ProjectCard } from './ProjectCard'
import { ProjectDetail } from './ProjectDetail'

export function ProjectsApp(ctx: AppContext) {
  const initial = (ctx.params?.slug as string | undefined) ?? projectsData[0]?.slug
  const [activeSlug, setActiveSlug] = useState<string>(initial ?? '')
  const active = projectsData.find((p) => p.slug === activeSlug) ?? projectsData[0]
  if (!active) {
    return <div className="h-full w-full flex items-center justify-center bg-zinc-900/85 text-white">No projects yet.</div>
  }
  return (
    <div className="h-full w-full flex bg-zinc-900/90 text-white">
      <aside className="w-60 border-r border-white/10 p-2 overflow-auto os-scroll">
        <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider opacity-50">Projects</div>
        <div className="flex flex-col gap-0.5">
          {projectsData.map((p) => (
            <ProjectCard
              key={p.slug}
              project={p}
              active={p.slug === active.slug}
              onSelect={() => setActiveSlug(p.slug)}
            />
          ))}
        </div>
      </aside>
      <div className="flex-1 overflow-auto os-scroll">
        <ProjectDetail project={active} body={active.body} />
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Wire deeplink for /projects/<slug>**

Modify `lib/os/deeplink.ts`'s `paramsFromPath` already returns `{ slug }` for `/projects/<slug>`. Confirm by reading the file. No change needed if so.

- [ ] **Step 7: Build + smoke**

```bash
bun run build
bun run dev &
sleep 3
curl -s http://localhost:3000/projects/idea | grep -q "IDEA HPC Platform" && echo "OK projects"
kill %1
```

- [ ] **Step 8: Commit**

```bash
git add apps/projects/ app/projects/ lib/content/load.ts
git commit -m "feat(projects): master/detail UI w/ MDX bodies + deeplink"
```

---

### Task 9: Messages app UI

**Files:**
- Create: `apps/messages/types.ts`
- Modify: `apps/messages/app.tsx`

- [ ] **Step 1: Types**

`apps/messages/types.ts`:
```ts
export type ChatMessage = {
  id: string
  role: 'visitor' | 'system'
  text: string
  ts: number
}

export type SendBody = {
  name: string
  email: string
  context?: 'recruiter' | 'engineer' | 'other'
  body: string
}
```

- [ ] **Step 2: Messages app**

`apps/messages/app.tsx`:
```tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import type { ChatMessage, SendBody } from './types'

const STORAGE_KEY = 'nateos.messages'

export function MessagesApp() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as ChatMessage[]) : []
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [context, setContext] = useState<SendBody['context']>('other')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      // localStorage may be unavailable; ignore.
    }
  }, [messages])

  async function send() {
    setError(null)
    const body = input.trim()
    if (!body || !name.trim() || !email.includes('@')) {
      setError('Name, email, and message required.')
      return
    }
    setSending(true)
    const visitorMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'visitor',
      text: body,
      ts: Date.now(),
    }
    setMessages((m) => [...m, visitorMsg])
    setInput('')
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, context, body } satisfies SendBody),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: 'system',
          text: "Delivered. Nate replies from nate@nateofarrell.com — usually within a day.",
          ts: Date.now(),
        },
      ])
    } catch (e) {
      setError(`Couldn't send: ${e instanceof Error ? e.message : 'unknown error'}`)
      // Mark the visitor message as failed
      setMessages((m) =>
        m.map((x) => (x.id === visitorMsg.id ? { ...x, text: `${x.text} ⚠ delivery failed` } : x)),
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="h-full w-full flex flex-col bg-zinc-900/90 text-white">
      <header className="px-5 py-3 border-b border-white/10">
        <h1 className="text-[14px] font-semibold">Nate O'Farrell</h1>
        <p className="text-[11px] opacity-60">iMessage · delivered to nate@nateofarrell.com</p>
      </header>

      <div className="flex-1 overflow-auto os-scroll px-4 py-4 flex flex-col gap-2">
        {messages.length === 0 ? (
          <div className="m-auto text-center opacity-60 text-[13px]">
            Send a message — it lands in Nate's inbox via Resend.
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] ${
                m.role === 'visitor'
                  ? 'self-end bg-blue-500 text-white rounded-br-md'
                  : 'self-start bg-white/10 text-white rounded-bl-md'
              }`}
            >
              {m.text}
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-3 border-t border-white/10 flex flex-col gap-2 bg-zinc-900/95">
        <div className="grid grid-cols-2 gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="bg-white/5 rounded-md px-3 py-1.5 text-[12px] outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="bg-white/5 rounded-md px-3 py-1.5 text-[12px] outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={context}
          onChange={(e) => setContext(e.target.value as SendBody['context'])}
          className="bg-white/5 rounded-md px-3 py-1.5 text-[12px] outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="recruiter">Recruiter / hiring manager</option>
          <option value="engineer">Engineering peer</option>
          <option value="other">Other</option>
        </select>
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write a message…"
            rows={2}
            className="flex-1 bg-white/5 rounded-md px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send()
            }}
          />
          <button
            type="button"
            disabled={sending}
            onClick={send}
            className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white text-[12px] font-medium"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
        {error ? <p className="text-red-400 text-[11px]">{error}</p> : null}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update manifest reference**

`apps/messages/app.tsx` exports `MessagesApp` — open `apps/messages/manifest.ts` and confirm import is `import { MessagesApp } from './app'` and `component: MessagesApp`. Adjust if different.

- [ ] **Step 4: Build + smoke**

```bash
bun run build
```

Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add apps/messages/
git commit -m "feat(messages): iMessage-style UI w/ localStorage history"
```

---

### Task 10: Resend integration

**Files:**
- Modify: `app/api/messages/route.ts`
- Create: `app/api/messages/route.test.ts` (optional smoke; only if Vitest can mock Resend cleanly — otherwise skip and rely on manual send)

- [ ] **Step 1: Implement POST**

`app/api/messages/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

const Body = z.object({
  name: z.string().min(1).max(120),
  email: z.email(),
  context: z.enum(['recruiter', 'engineer', 'other']).default('other'),
  body: z.string().min(1).max(5000),
  // honeypot
  _gotcha: z.string().optional(),
})

const TO = 'nate@nateofarrell.com'

// Naive in-memory rate limit (3 per IP per hour). Resets on cold start; good enough for v1.
const buckets = new Map<string, number[]>()
const LIMIT = 3
const WINDOW_MS = 60 * 60 * 1000

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const arr = (buckets.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (arr.length >= LIMIT) return false
  arr.push(now)
  buckets.set(ip, arr)
  return true
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
  }

  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = Body.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
  if (parsed.data._gotcha) {
    // Honeypot tripped — pretend success
    return NextResponse.json({ ok: true })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Email not configured' }, { status: 503 })
  }
  const resend = new Resend(apiKey)
  const { name, email, context, body } = parsed.data
  try {
    await resend.emails.send({
      from: 'NateOS <noreply@nate.cx>',
      replyTo: email,
      to: TO,
      subject: `[NateOS · ${context}] ${name}`,
      text: `From: ${name} <${email}> (${context})\n\n${body}`,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('resend send failed', e)
    return NextResponse.json({ error: 'Send failed' }, { status: 502 })
  }
}
```

The `from: 'NateOS <noreply@nate.cx>'` requires DNS for `nate.cx` to be set up in Resend (SPF + DKIM). If not configured yet, swap to `from: 'NateOS <onboarding@resend.dev>'` (Resend's shared sender for testing) — flag this in your report so the user knows to update before production.

- [ ] **Step 2: Verify build**

```bash
bun run build
```

Expected: clean.

- [ ] **Step 3: Manual test with dev server (only if RESEND_API_KEY is set)**

```bash
bun run dev &
sleep 3
curl -X POST http://localhost:3000/api/messages \
  -H 'content-type: application/json' \
  -d '{"name":"smoke","email":"smoke@example.com","body":"hello"}' \
  -i
kill %1
```

Expected: `503 Email not configured` (because no key in env), or `200 ok` if the user has set the key.

- [ ] **Step 4: Commit**

```bash
git add app/api/messages/route.ts
git commit -m "feat(messages): Resend POST handler w/ Zod + honeypot + rate limit"
```

---

### Task 11: Safari bookmarks app

**Files:**
- Modify: `content/links.mdx`
- Create: `apps/safari/Bookmarks.tsx`, `app/safari/data.ts`
- Modify: `apps/safari/app.tsx`

- [ ] **Step 1: links.mdx with categorized bookmarks**

`content/links.mdx`:
```mdx
---
bookmarks:
  - label: GitHub
    url: https://github.com/cfsnate
    category: code
  - label: LinkedIn
    url: https://www.linkedin.com/in/nateofarrell/
    category: social
  - label: IDEA HPC Platform
    url: https://github.com/cfs-energy/idea
    category: code
  - label: Sleepbar
    url: https://sleepbar.app
    category: other
  - label: re:Invent 2022 (MFG 205)
    url: https://www.youtube.com/watch?v=vrA-KiYXTug
    category: media
---
```

- [ ] **Step 2: Static data + bookmark list**

`app/safari/data.ts`:
```ts
import { loadLinks } from '@/lib/content/load'
export const bookmarks = loadLinks()
```

`apps/safari/Bookmarks.tsx`:
```tsx
'use client'
import type { Bookmark } from '@/lib/content/schema'

export function BookmarksBar({ items, onPick }: { items: Bookmark[]; onPick: (url: string) => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-zinc-900/95 overflow-x-auto os-scroll">
      {items.map((b) => (
        <button
          key={b.url}
          type="button"
          onClick={() => onPick(b.url)}
          className="flex-shrink-0 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[11px]"
        >
          {b.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Safari app**

`apps/safari/app.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { bookmarks } from '@/app/safari/data'
import { BookmarksBar } from './Bookmarks'

export function SafariApp() {
  const [url, setUrl] = useState<string>(bookmarks[0]?.url ?? 'about:blank')
  const [navInput, setNavInput] = useState<string>(url)

  function go(target: string) {
    setUrl(target)
    setNavInput(target)
  }

  return (
    <div className="h-full w-full flex flex-col bg-zinc-900/95 text-white">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <span className="opacity-60 text-[12px]">←</span>
        <span className="opacity-60 text-[12px]">→</span>
        <input
          value={navInput}
          onChange={(e) => setNavInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') go(navInput)
          }}
          className="flex-1 bg-white/5 rounded-md px-3 py-1 text-[12px] outline-none focus:ring-1 focus:ring-blue-500"
        />
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] opacity-70 hover:underline"
        >
          Open ↗
        </a>
      </div>
      <BookmarksBar items={bookmarks} onPick={go} />
      <div className="flex-1 bg-white relative">
        <iframe
          key={url}
          src={url}
          title="Safari content"
          className="absolute inset-0 w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          referrerPolicy="no-referrer"
          onError={() => undefined}
        />
        <div className="absolute bottom-3 right-3 text-[10px] bg-black/70 text-white/80 px-2 py-1 rounded">
          Some sites block embedding. Click "Open ↗" if blank.
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Build + smoke**

```bash
bun run build
```

Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add content/links.mdx apps/safari/ app/safari/
git commit -m "feat(safari): bookmark bar + iframe browser w/ X-Frame fallback"
```

---

### Task 12: Finder virtual filesystem + UI

**Files:**
- Create: `apps/finder/vfs.ts`
- Modify: `apps/finder/app.tsx`

- [ ] **Step 1: Build virtual filesystem from /content/**

`apps/finder/vfs.ts`:
```ts
export type VfsEntry = {
  name: string
  kind: 'folder' | 'file'
  path: string
  /** For files: target path on the real site (e.g. /resume) or external URL. */
  open?: string
  size?: number
}

export const VFS_ROOT: VfsEntry = {
  name: 'Nate',
  kind: 'folder',
  path: '/',
}

export const VFS: Record<string, VfsEntry[]> = {
  '/': [
    { name: 'Profile.app', kind: 'file', path: '/Profile.app', open: '/profile' },
    { name: 'Resume.pdf', kind: 'file', path: '/Resume.pdf', open: '/resume.pdf' },
    { name: 'Projects', kind: 'folder', path: '/Projects' },
    { name: 'Documents', kind: 'folder', path: '/Documents' },
    { name: 'Links.txt', kind: 'file', path: '/Links.txt', open: '/safari' },
    { name: 'Calendar', kind: 'folder', path: '/Calendar' },
  ],
  '/Projects': [
    { name: 'IDEA.md', kind: 'file', path: '/Projects/IDEA.md', open: '/projects/idea' },
    { name: 'Sleepbar.md', kind: 'file', path: '/Projects/Sleepbar.md', open: '/projects/sleepbar' },
    { name: 're:Invent 2022.md', kind: 'file', path: '/Projects/re:Invent 2022.md', open: '/projects/reinvent-2022' },
  ],
  '/Documents': [
    { name: 'About.md', kind: 'file', path: '/Documents/About.md', open: '/profile' },
    { name: 'Resume.md', kind: 'file', path: '/Documents/Resume.md', open: '/resume' },
  ],
  '/Calendar': [
    { name: 'Book intro chat ↗', kind: 'file', path: '/Calendar/Book.url', open: '/calendar' },
  ],
}

export function listDir(path: string): VfsEntry[] {
  return VFS[path] ?? []
}
```

- [ ] **Step 2: Finder app**

`apps/finder/app.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { useWindowStore } from '@/lib/os/window-store'
import { listDir, type VfsEntry } from './vfs'

const SIDEBAR: { label: string; path: string }[] = [
  { label: 'Nate', path: '/' },
  { label: 'Projects', path: '/Projects' },
  { label: 'Documents', path: '/Documents' },
  { label: 'Calendar', path: '/Calendar' },
]

export function FinderApp() {
  const [cwd, setCwd] = useState('/')
  const openApp = useWindowStore((s) => s.openApp)
  const entries = listDir(cwd)

  function activate(entry: VfsEntry) {
    if (entry.kind === 'folder') {
      setCwd(entry.path)
      return
    }
    if (!entry.open) return
    if (entry.open.startsWith('/projects/')) {
      const slug = entry.open.split('/').pop()
      openApp('projects', { slug })
      return
    }
    if (entry.open === '/profile') openApp('profile')
    else if (entry.open === '/resume') openApp('resume')
    else if (entry.open === '/safari') openApp('safari')
    else if (entry.open === '/calendar') openApp('calendar')
    else if (entry.open.endsWith('.pdf')) window.open(entry.open, '_blank')
  }

  return (
    <div className="h-full w-full flex bg-zinc-900/90 text-white">
      <aside className="w-44 border-r border-white/10 p-2 text-[12px]">
        <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider opacity-50">Locations</div>
        <ul className="flex flex-col gap-0.5">
          {SIDEBAR.map((s) => (
            <li key={s.path}>
              <button
                type="button"
                onClick={() => setCwd(s.path)}
                className={`w-full text-left px-2 py-1.5 rounded-md ${
                  s.path === cwd ? 'bg-blue-500/80' : 'hover:bg-white/5'
                }`}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex-1 overflow-auto os-scroll p-3">
        <div className="text-[11px] opacity-60 mb-2">{cwd}</div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3">
          {entries.length === 0 ? (
            <div className="opacity-50 text-[12px] col-span-full">Empty.</div>
          ) : null}
          {entries.map((e) => (
            <button
              key={e.path}
              type="button"
              onDoubleClick={() => activate(e)}
              onClick={() => undefined}
              className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-white/5 focus:bg-white/10 outline-none"
              title={e.name}
            >
              <div className="w-12 h-12 flex items-center justify-center text-[28px]">
                {e.kind === 'folder' ? '📁' : '📄'}
              </div>
              <div className="text-[11px] text-center break-words leading-tight max-w-full">{e.name}</div>
            </button>
          ))}
        </div>
        <p className="text-[10px] opacity-50 mt-3">Double-click to open.</p>
      </div>
    </div>
  )
}
```

(Folder/file icons here are emoji for v1. Using extracted `GenericFolderIcon.png` and `GenericDocumentIcon.png` would be nicer; substitute via `<Image>` if time permits — emoji is acceptable v1 fallback.)

- [ ] **Step 3: Build + smoke**

```bash
bun run build
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add apps/finder/
git commit -m "feat(finder): virtual filesystem + sidebar + icon view"
```

---

### Task 13: Settings — Appearance + Wallpaper picker

**Files:**
- Create: `lib/settings/store.ts`, `apps/settings/AppearancePane.tsx`, `apps/settings/WallpaperPane.tsx`
- Modify: `apps/settings/app.tsx`, `components/os/Wallpaper.tsx`

- [ ] **Step 1: Settings store**

`lib/settings/store.ts`:
```ts
'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppearanceMode = 'light' | 'dark' | 'auto'

type SettingsState = {
  appearance: AppearanceMode
  wallpaper: string
  reduceMotion: boolean
  setAppearance(mode: AppearanceMode): void
  setWallpaper(path: string): void
  setReduceMotion(v: boolean): void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      appearance: 'dark',
      wallpaper: '/apple/wallpapers/default.jpg',
      reduceMotion: false,
      setAppearance: (mode) => set({ appearance: mode }),
      setWallpaper: (path) => set({ wallpaper: path }),
      setReduceMotion: (v) => set({ reduceMotion: v }),
    }),
    { name: 'nateos.settings' },
  ),
)
```

- [ ] **Step 2: Wallpaper component reads from store**

Modify `components/os/Wallpaper.tsx`:
```tsx
'use client'
import Image from 'next/image'
import { useSettings } from '@/lib/settings/store'

const FALLBACK_GRADIENT =
  'linear-gradient(135deg, #2a3b5f 0%, #5e8bb8 50%, #b88a8a 100%)'

export function Wallpaper() {
  const url = useSettings((s) => s.wallpaper)
  return (
    <div className="absolute inset-0 -z-10" style={{ background: FALLBACK_GRADIENT }}>
      <Image
        key={url}
        src={url}
        alt=""
        fill
        priority
        sizes="100vw"
        style={{ objectFit: 'cover' }}
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
      />
    </div>
  )
}
```

(`Wallpaper` no longer takes a `src` prop; the store is the source of truth.)

- [ ] **Step 3: Appearance pane**

`apps/settings/AppearancePane.tsx`:
```tsx
'use client'
import { type AppearanceMode, useSettings } from '@/lib/settings/store'

const MODES: { value: AppearanceMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'auto', label: 'Auto' },
]

export function AppearancePane() {
  const mode = useSettings((s) => s.appearance)
  const setMode = useSettings((s) => s.setAppearance)
  const reduceMotion = useSettings((s) => s.reduceMotion)
  const setReduceMotion = useSettings((s) => s.setReduceMotion)
  return (
    <div className="flex flex-col gap-5">
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
        <p className="text-[11px] opacity-50 mt-2">
          Theme tokens land in Plan 3 (retro skin). Currently visual-only.
        </p>
      </div>
      <label className="flex items-center gap-3 text-[12px]">
        <input
          type="checkbox"
          checked={reduceMotion}
          onChange={(e) => setReduceMotion(e.target.checked)}
        />
        Reduce motion (skip boot animation, dock magnification)
      </label>
    </div>
  )
}
```

- [ ] **Step 4: Wallpaper pane**

`apps/settings/WallpaperPane.tsx`:
```tsx
'use client'
import Image from 'next/image'
import { useSettings } from '@/lib/settings/store'

const WALLPAPERS: { name: string; path: string }[] = [
  { name: 'NateOS Big Sur', path: '/apple/wallpapers/nateos-big-sur-dark.jpg' },
  { name: 'Sonoma Horizon', path: '/apple/wallpapers/sonoma-horizon.jpg' },
  { name: 'Sonoma', path: '/apple/wallpapers/sonoma.jpg' },
  { name: 'Mac Blue', path: '/apple/wallpapers/mac-blue.jpg' },
  { name: 'Radial Sky Blue', path: '/apple/wallpapers/radial-sky-blue.jpg' },
]

export function WallpaperPane() {
  const current = useSettings((s) => s.wallpaper)
  const setWallpaper = useSettings((s) => s.setWallpaper)
  return (
    <div>
      <h3 className="text-[12px] font-semibold mb-3">Wallpaper</h3>
      <div className="grid grid-cols-3 gap-3">
        {WALLPAPERS.map((w) => (
          <button
            key={w.path}
            type="button"
            onClick={() => setWallpaper(w.path)}
            className={`relative aspect-video rounded-md overflow-hidden border-2 ${
              current === w.path ? 'border-blue-500' : 'border-transparent hover:border-white/20'
            }`}
          >
            <Image src={w.path} alt={w.name} fill sizes="200px" style={{ objectFit: 'cover' }} />
            <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] py-1 px-1.5 truncate">
              {w.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Settings shell**

`apps/settings/app.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { AppearancePane } from './AppearancePane'
import { WallpaperPane } from './WallpaperPane'

type Pane = 'appearance' | 'wallpaper'

const ITEMS: { id: Pane; label: string }[] = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'wallpaper', label: 'Wallpaper' },
]

export function SettingsApp() {
  const [pane, setPane] = useState<Pane>('appearance')
  return (
    <div className="h-full w-full flex bg-zinc-900/95 text-white">
      <aside className="w-44 border-r border-white/10 p-2">
        {ITEMS.map((i) => (
          <button
            key={i.id}
            type="button"
            onClick={() => setPane(i.id)}
            className={`w-full text-left px-3 py-1.5 rounded-md text-[12px] ${
              pane === i.id ? 'bg-blue-500/80' : 'hover:bg-white/5'
            }`}
          >
            {i.label}
          </button>
        ))}
      </aside>
      <div className="flex-1 overflow-auto os-scroll p-6">
        {pane === 'appearance' ? <AppearancePane /> : <WallpaperPane />}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Build**

```bash
bun run build
```

Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add lib/settings/store.ts apps/settings/ components/os/Wallpaper.tsx
git commit -m "feat(settings): Appearance + Wallpaper panes w/ persisted store"
```

---

### Task 14: Calendar — Cal.com embed

**Files:**
- Modify: `apps/calendar/app.tsx`

- [ ] **Step 1: Calendar app**

`apps/calendar/app.tsx`:
```tsx
'use client'
import { useEffect, useRef } from 'react'

const CAL_LINK = 'https://cal.com/nateofarrell/intro'

export function CalendarApp() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Lazy-load Cal.com embed only when this component mounts.
    // Falls back to a simple link if the embed fails to load (e.g. blocked).
    if (!ref.current) return
    const iframe = document.createElement('iframe')
    iframe.src = CAL_LINK
    iframe.title = 'Book intro chat'
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.border = '0'
    iframe.allow = 'fullscreen; clipboard-read; clipboard-write'
    iframe.referrerPolicy = 'no-referrer'
    ref.current.appendChild(iframe)
    return () => {
      iframe.remove()
    }
  }, [])

  return (
    <div className="h-full w-full flex flex-col bg-zinc-900/95 text-white">
      <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-[14px] font-semibold">Book an intro chat</h1>
          <p className="text-[11px] opacity-60">15 minutes · Cal.com</p>
        </div>
        <a
          href={CAL_LINK}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-blue-400 hover:underline"
        >
          Open in Cal.com ↗
        </a>
      </div>
      <div ref={ref} className="flex-1 bg-white" />
    </div>
  )
}
```

If `cal.com/nateofarrell/intro` doesn't exist yet, the iframe will show a Cal.com 404 — that's the user's job to set up. The "Open in Cal.com" link is the fallback.

- [ ] **Step 2: Commit**

```bash
git add apps/calendar/app.tsx
git commit -m "feat(calendar): Cal.com iframe embed"
```

---

### Task 15: TextEdit MDX viewer

**Files:**
- Modify: `apps/textedit/app.tsx`

- [ ] **Step 1: TextEdit app**

`apps/textedit/app.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'
import type { AppContext } from '@/lib/os/types'

export function TextEditApp(ctx: AppContext) {
  const file = (ctx.params?.file as string | undefined) ?? 'profile.mdx'
  const [content, setContent] = useState<string>('Loading…')

  useEffect(() => {
    let cancelled = false
    fetch(`/api/content?file=${encodeURIComponent(file)}`)
      .then((r) => (r.ok ? r.text() : `Could not load: ${file}`))
      .then((text) => {
        if (!cancelled) setContent(text)
      })
      .catch(() => {
        if (!cancelled) setContent(`Could not load: ${file}`)
      })
    return () => {
      cancelled = true
    }
  }, [file])

  return (
    <div className="h-full w-full flex flex-col bg-zinc-50 text-zinc-900">
      <header className="px-4 py-2 border-b border-zinc-300 text-[11px] text-zinc-600 bg-zinc-100">
        {file}
      </header>
      <pre className="flex-1 overflow-auto os-scroll-dark px-6 py-5 text-[13px] font-mono leading-relaxed whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  )
}
```

- [ ] **Step 2: Add /api/content route**

Create `app/api/content/route.ts`:
```ts
import { readFileSync, existsSync } from 'node:fs'
import { join, normalize } from 'node:path'
import { NextResponse } from 'next/server'

const ROOT = join(process.cwd(), 'content')

export async function GET(req: Request) {
  const url = new URL(req.url)
  const file = url.searchParams.get('file')
  if (!file) return NextResponse.json({ error: 'missing file' }, { status: 400 })
  // Prevent path traversal: resolve against ROOT, ensure within ROOT.
  const safe = normalize(join(ROOT, file))
  if (!safe.startsWith(ROOT)) {
    return NextResponse.json({ error: 'invalid path' }, { status: 400 })
  }
  if (!existsSync(safe)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }
  const text = readFileSync(safe, 'utf8')
  return new NextResponse(text, { status: 200, headers: { 'content-type': 'text/plain' } })
}
```

- [ ] **Step 3: Build**

```bash
bun run build
```

- [ ] **Step 4: Commit**

```bash
git add apps/textedit/app.tsx app/api/content/route.ts
git commit -m "feat(textedit): MDX viewer w/ /api/content read"
```

---

### Task 16: Calculator engine + UI + tests

**Files:**
- Create: `apps/calculator/engine.ts`, `apps/calculator/engine.test.ts`
- Modify: `apps/calculator/app.tsx`

- [ ] **Step 1: Engine tests first**

`apps/calculator/engine.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { calc, type CalcState, initialState } from './engine'

function run(seq: (number | string)[]): CalcState {
  let s = initialState()
  for (const k of seq) {
    s = calc(s, typeof k === 'number' ? { kind: 'digit', d: k } : { kind: 'op', op: k })
  }
  return s
}

describe('calculator engine', () => {
  it('1 + 2 = 3', () => {
    const s = run([1, '+', 2, '='])
    expect(s.display).toBe('3')
  })
  it('10 / 4 = 2.5', () => {
    const s = run([1, 0, '/', 4, '='])
    expect(s.display).toBe('2.5')
  })
  it('7 - 3 - 1 = 3', () => {
    const s = run([7, '-', 3, '-', 1, '='])
    expect(s.display).toBe('3')
  })
  it('AC clears', () => {
    let s = run([1, 2, 3])
    s = calc(s, { kind: 'op', op: 'AC' })
    expect(s.display).toBe('0')
  })
  it('±  toggles sign', () => {
    let s = run([5])
    s = calc(s, { kind: 'op', op: '±' })
    expect(s.display).toBe('-5')
  })
  it('% divides by 100', () => {
    let s = run([5, 0])
    s = calc(s, { kind: 'op', op: '%' })
    expect(s.display).toBe('0.5')
  })
})
```

- [ ] **Step 2: Run, expect FAIL**

```bash
bun run test apps/calculator/engine.test.ts
```

- [ ] **Step 3: Implement engine**

`apps/calculator/engine.ts`:
```ts
export type Op = '+' | '-' | '*' | '/' | '=' | 'AC' | '±' | '%' | '.'

export type Action = { kind: 'digit'; d: number } | { kind: 'op'; op: Op }

export type CalcState = {
  display: string
  acc: number | null
  pendingOp: '+' | '-' | '*' | '/' | null
  freshDigit: boolean
}

export function initialState(): CalcState {
  return { display: '0', acc: null, pendingOp: null, freshDigit: true }
}

function toNum(s: string): number {
  return Number(s)
}
function fmt(n: number): string {
  if (!Number.isFinite(n)) return 'Error'
  // Trim long floats
  const s = Number(n.toPrecision(12)).toString()
  return s
}

function applyPending(state: CalcState): CalcState {
  if (state.pendingOp === null || state.acc === null) {
    return { ...state, acc: toNum(state.display) }
  }
  const a = state.acc
  const b = toNum(state.display)
  let r = a
  switch (state.pendingOp) {
    case '+': r = a + b; break
    case '-': r = a - b; break
    case '*': r = a * b; break
    case '/': r = b === 0 ? NaN : a / b; break
  }
  return { ...state, acc: r, display: fmt(r) }
}

export function calc(state: CalcState, action: Action): CalcState {
  if (action.kind === 'digit') {
    if (state.freshDigit) {
      return { ...state, display: String(action.d), freshDigit: false }
    }
    if (state.display === '0') return { ...state, display: String(action.d) }
    return { ...state, display: state.display + String(action.d) }
  }
  const op = action.op
  if (op === 'AC') return initialState()
  if (op === '.') {
    if (state.freshDigit) return { ...state, display: '0.', freshDigit: false }
    if (state.display.includes('.')) return state
    return { ...state, display: `${state.display}.` }
  }
  if (op === '±') {
    if (state.display === '0') return state
    const flipped = state.display.startsWith('-')
      ? state.display.slice(1)
      : `-${state.display}`
    return { ...state, display: flipped }
  }
  if (op === '%') {
    const v = toNum(state.display) / 100
    return { ...state, display: fmt(v), freshDigit: true }
  }
  if (op === '=') {
    const next = applyPending(state)
    return { ...next, pendingOp: null, freshDigit: true }
  }
  // Arithmetic operator
  const next = applyPending(state)
  return { ...next, pendingOp: op, freshDigit: true }
}
```

- [ ] **Step 4: Tests pass**

```bash
bun run test apps/calculator/engine.test.ts
```

Expected: 6/6 PASS.

- [ ] **Step 5: Calculator UI**

`apps/calculator/app.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'
import { type CalcState, calc, initialState, type Op } from './engine'
import { Snake } from './Snake'

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

const BTN = 'h-12 rounded-full text-[16px] font-medium flex items-center justify-center'
const NUM = `${BTN} bg-zinc-700/80 text-white hover:bg-zinc-600`
const FN = `${BTN} bg-zinc-500/80 text-black hover:bg-zinc-400`
const OP = `${BTN} bg-orange-500 text-white hover:bg-orange-400`

export function CalculatorApp() {
  const [state, setState] = useState<CalcState>(initialState)
  const [snake, setSnake] = useState(false)
  const [seq, setSeq] = useState<string[]>([])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Konami detection
      const next = [...seq, e.key].slice(-KONAMI.length)
      setSeq(next)
      if (next.join(',') === KONAMI.join(',')) setSnake(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [seq])

  if (snake) return <Snake onExit={() => setSnake(false)} />

  function digit(d: number) {
    setState((s) => calc(s, { kind: 'digit', d }))
  }
  function op(o: Op) {
    setState((s) => calc(s, { kind: 'op', op: o }))
  }

  return (
    <div className="h-full w-full flex flex-col bg-zinc-900 text-white">
      <div className="flex-1 flex items-end justify-end px-5 py-4 text-[44px] font-light tracking-tight">
        {state.display}
      </div>
      <div className="grid grid-cols-4 gap-2 p-3">
        <button type="button" className={FN} onClick={() => op('AC')}>AC</button>
        <button type="button" className={FN} onClick={() => op('±')}>±</button>
        <button type="button" className={FN} onClick={() => op('%')}>%</button>
        <button type="button" className={OP} onClick={() => op('/')}>÷</button>

        {[7, 8, 9].map((d) => (
          <button key={d} type="button" className={NUM} onClick={() => digit(d)}>{d}</button>
        ))}
        <button type="button" className={OP} onClick={() => op('*')}>×</button>

        {[4, 5, 6].map((d) => (
          <button key={d} type="button" className={NUM} onClick={() => digit(d)}>{d}</button>
        ))}
        <button type="button" className={OP} onClick={() => op('-')}>−</button>

        {[1, 2, 3].map((d) => (
          <button key={d} type="button" className={NUM} onClick={() => digit(d)}>{d}</button>
        ))}
        <button type="button" className={OP} onClick={() => op('+')}>+</button>

        <button type="button" className={`${NUM} col-span-2`} onClick={() => digit(0)}>0</button>
        <button type="button" className={NUM} onClick={() => op('.')}>.</button>
        <button type="button" className={OP} onClick={() => op('=')}>=</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Snake easter egg**

`apps/calculator/Snake.tsx`:
```tsx
'use client'
import { useEffect, useRef, useState } from 'react'

const COLS = 16
const ROWS = 20
const TICK = 120

type Point = { x: number; y: number }

function rand(): Point {
  return { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
}

export function Snake({ onExit }: { onExit: () => void }) {
  const [snake, setSnake] = useState<Point[]>([{ x: 8, y: 10 }])
  const [food, setFood] = useState<Point>(rand)
  const [dir, setDir] = useState<Point>({ x: 1, y: 0 })
  const [dead, setDead] = useState(false)
  const dirRef = useRef(dir)
  dirRef.current = dir

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') return onExit()
      const map: Record<string, Point> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      }
      const next = map[e.key]
      if (!next) return
      const cur = dirRef.current
      // Block reversal
      if (next.x + cur.x === 0 && next.y + cur.y === 0) return
      setDir(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onExit])

  useEffect(() => {
    if (dead) return
    const t = setInterval(() => {
      setSnake((s) => {
        const head = { x: s[0].x + dirRef.current.x, y: s[0].y + dirRef.current.y }
        if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) {
          setDead(true)
          return s
        }
        if (s.some((p) => p.x === head.x && p.y === head.y)) {
          setDead(true)
          return s
        }
        const ate = head.x === food.x && head.y === food.y
        const next = [head, ...s]
        if (!ate) next.pop()
        if (ate) setFood(rand())
        return next
      })
    }, TICK)
    return () => clearInterval(t)
  }, [dead, food])

  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-zinc-900 text-white">
      <div className="text-[10px] opacity-60">↑↓←→ to move · Esc to exit{dead ? ' · DEAD — refresh' : ''}</div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 14px)`,
          gridTemplateRows: `repeat(${ROWS}, 14px)`,
          gap: 1,
        }}
      >
        {Array.from({ length: ROWS * COLS }).map((_, i) => {
          const x = i % COLS
          const y = Math.floor(i / COLS)
          const isSnake = snake.some((p) => p.x === x && p.y === y)
          const isHead = snake[0].x === x && snake[0].y === y
          const isFood = food.x === x && food.y === y
          return (
            <div
              key={i}
              className={`w-[14px] h-[14px] ${
                isHead ? 'bg-emerald-300' : isSnake ? 'bg-emerald-500' : isFood ? 'bg-orange-400' : 'bg-zinc-800'
              }`}
            />
          )
        })}
      </div>
      <button type="button" onClick={onExit} className="mt-2 text-[11px] opacity-60 hover:opacity-100">
        Back to Calculator
      </button>
    </div>
  )
}
```

- [ ] **Step 7: Build**

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

All clean. Tests should be 12+ now (4 window-store + 6 terminal + 6 calc + 3 content load).

- [ ] **Step 8: Commit**

```bash
git add apps/calculator/
git commit -m "feat(calculator): full calc engine w/ tests + Snake easter egg"
```

---

### Task 17: QR vCard widget on desktop

**Files:**
- Create: `scripts/build-vcard.ts`, `components/desktop/QrVCard.tsx`, `components/desktop/DesktopWidgets.tsx`
- Modify: `package.json`, `components/os/DesktopShell.tsx`

- [ ] **Step 1: vCard + QR build script**

`scripts/build-vcard.ts`:
```ts
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import qrcode from 'qrcode'
import { loadProfile } from '../lib/content/load'

const profile = loadProfile()

const vcard = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  `FN:${profile.name}`,
  `EMAIL:${profile.email}`,
  profile.phone ? `TEL:${profile.phone}` : '',
  `URL:https://nate.cx`,
  `TITLE:${profile.tagline}`,
  `ADR:;;;${profile.location};;;`,
  'END:VCARD',
]
  .filter(Boolean)
  .join('\n')

const pub = join(process.cwd(), 'public')
mkdirSync(pub, { recursive: true })
writeFileSync(join(pub, 'contact.vcf'), vcard)
console.log('✓ public/contact.vcf')

const dataUrl = await qrcode.toDataURL(`https://nate.cx/contact.vcf`, {
  errorCorrectionLevel: 'M',
  margin: 1,
  width: 320,
  color: { dark: '#000000', light: '#ffffff' },
})
const base64 = dataUrl.split(',')[1]
writeFileSync(join(pub, 'qr.png'), Buffer.from(base64, 'base64'))
console.log('✓ public/qr.png')
```

- [ ] **Step 2: Hook into prebuild**

Edit `package.json` `scripts.prebuild`:
```json
{
  "scripts": {
    "build:pdf": "bun run scripts/build-pdf.ts",
    "build:vcard": "bun run scripts/build-vcard.ts",
    "prebuild": "bun run build:pdf && bun run build:vcard"
  }
}
```

- [ ] **Step 3: Run + verify**

```bash
bun run build:vcard
ls -lh public/contact.vcf public/qr.png
```

Expected: both files exist, qr.png ~4–8KB, contact.vcf ~200 bytes.

- [ ] **Step 4: Add to .gitignore**

```bash
grep -q '^/public/contact.vcf$' .gitignore || echo '/public/contact.vcf' >> .gitignore
grep -q '^/public/qr.png$' .gitignore || echo '/public/qr.png' >> .gitignore
```

- [ ] **Step 5: QR widget component**

`components/desktop/QrVCard.tsx`:
```tsx
'use client'
import Image from 'next/image'

export function QrVCard() {
  return (
    <a
      href="/contact.vcf"
      download="Nate_OFarrell.vcf"
      className="absolute top-12 right-4 z-10 w-[140px] rounded-2xl backdrop-blur-md bg-zinc-900/55 border border-white/10 p-3 text-white text-[10px] hover:bg-zinc-900/70 transition-colors"
    >
      <Image
        src="/qr.png"
        alt="Save Nate's contact"
        width={120}
        height={120}
        className="rounded-md w-full h-auto"
      />
      <div className="mt-2 font-medium">Save my contact</div>
      <div className="opacity-70">Scan with Camera</div>
    </a>
  )
}
```

- [ ] **Step 6: Desktop widgets host**

`components/desktop/DesktopWidgets.tsx`:
```tsx
'use client'
import { QrVCard } from './QrVCard'

export function DesktopWidgets() {
  return <QrVCard />
}
```

- [ ] **Step 7: Mount in DesktopShell**

Modify `components/os/DesktopShell.tsx`:
```tsx
'use client'
import { Suspense } from 'react'
import { DeeplinkRouter } from '@/components/deeplink/DeeplinkRouter'
import { DesktopWidgets } from '@/components/desktop/DesktopWidgets'
import { Dock } from './Dock'
import { Menubar } from './Menubar'
import { Wallpaper } from './Wallpaper'
import { WindowLayer } from './WindowLayer'

export function DesktopShell({ children }: { children: React.ReactNode }) {
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

- [ ] **Step 8: Build**

```bash
bun run build
```

Expected: prebuild runs vcard + pdf, then next build. Clean.

- [ ] **Step 9: Commit**

```bash
git add scripts/build-vcard.ts components/desktop/ components/os/DesktopShell.tsx package.json .gitignore
git commit -m "feat(desktop): QR vCard widget + build-time vcf/qr generation"
```

---

### Task 18: Wire Terminal `cat` to real content + tests

**Files:**
- Modify: `apps/terminal/commands.ts`, `apps/terminal/commands.test.ts`

- [ ] **Step 1: Update tests**

Edit `apps/terminal/commands.test.ts` — add at the end of `describe('terminal commands', ...)`:
```ts
  it('cat resume.mdx returns content fetched via /api/content', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => '---\nsummary: hello\n---\nbody',
    } as unknown as Response)
    const out = await runCommand('cat resume.mdx', ctx)
    expect(out).toMatch(/summary/)
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/api/content'))
    fetchSpy.mockRestore()
  })

  it('cat without arg returns usage', async () => {
    const out = await runCommand('cat', ctx)
    expect(out).toBe('usage: cat <file>')
  })
```

(Test file already imports `vi`. If not, add `import { vi } from 'vitest'`.)

- [ ] **Step 2: Run, expect FAIL**

```bash
bun run test apps/terminal/commands.test.ts
```

Expected: new tests fail because current `cat` returns the placeholder.

- [ ] **Step 3: Implement `cat`**

In `apps/terminal/commands.ts`, replace the existing `case 'cat'`:
```ts
    case 'cat': {
      const file = args[0]
      if (!file) return 'usage: cat <file>'
      try {
        const r = await fetch(`/api/content?file=${encodeURIComponent(file)}`)
        if (!r.ok) return `cat: ${file}: ${r.status} ${r.statusText}`
        return await r.text()
      } catch (e) {
        return `cat: ${e instanceof Error ? e.message : 'unknown error'}`
      }
    }
```

- [ ] **Step 4: Tests pass**

```bash
bun run test apps/terminal/commands.test.ts
```

Expected: 8/8 pass.

- [ ] **Step 5: Smoke**

```bash
bun run dev &
sleep 3
# In a different shell, manually open a Terminal window and run `cat profile.mdx` — should show real frontmatter.
kill %1
```

- [ ] **Step 6: Commit**

```bash
git add apps/terminal/
git commit -m "feat(terminal): cat reads real content via /api/content"
```

---

### Task 19: Desktop icons (Resume.pdf shortcut + Projects folder)

**Files:**
- Create: `components/desktop/DesktopIcons.tsx`
- Modify: `components/desktop/DesktopWidgets.tsx`

- [ ] **Step 1: DesktopIcons**

`components/desktop/DesktopIcons.tsx`:
```tsx
'use client'
import Image from 'next/image'
import { useWindowStore } from '@/lib/os/window-store'

export function DesktopIcons() {
  const openApp = useWindowStore((s) => s.openApp)
  return (
    <div className="absolute top-10 left-3 z-10 flex flex-col gap-3">
      <a
        href="/resume.pdf"
        download="Nate_OFarrell_Resume.pdf"
        className="flex flex-col items-center gap-1 w-16 hover:bg-white/10 rounded-md p-1.5 transition-colors"
      >
        <Image
          src="/apple/icons/GenericDocumentIcon.png"
          alt="Resume.pdf"
          width={48}
          height={48}
        />
        <span className="text-[10px] text-white drop-shadow font-medium">Resume.pdf</span>
      </a>
      <button
        type="button"
        onClick={() => openApp('projects')}
        className="flex flex-col items-center gap-1 w-16 hover:bg-white/10 rounded-md p-1.5 transition-colors"
      >
        <Image
          src="/apple/icons/GenericFolderIcon.png"
          alt="Projects"
          width={48}
          height={48}
        />
        <span className="text-[10px] text-white drop-shadow font-medium">Projects</span>
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Mount in DesktopWidgets**

Modify `components/desktop/DesktopWidgets.tsx`:
```tsx
'use client'
import { DesktopIcons } from './DesktopIcons'
import { QrVCard } from './QrVCard'

export function DesktopWidgets() {
  return (
    <>
      <DesktopIcons />
      <QrVCard />
    </>
  )
}
```

- [ ] **Step 3: Build + smoke**

```bash
bun run build
```

- [ ] **Step 4: Commit**

```bash
git add components/desktop/DesktopIcons.tsx components/desktop/DesktopWidgets.tsx
git commit -m "feat(desktop): Resume.pdf shortcut + Projects folder icons"
```

---

### Task 20: End-to-end smoke + final cleanup

**Files:** none new.

- [ ] **Step 1: Run full suite**

```bash
bun run typecheck
bun run lint
bun run check:content
bun run test
bun run build
```

All clean. Tests should be ≥ 12 passing.

- [ ] **Step 2: Visual smoke check**

Run `bun run dev`. Open http://localhost:3000 and manually verify:

- [ ] Boot animation runs
- [ ] Terminal opens by default; ASCII banner shows NATE (cyan) + OS (pink)
- [ ] Open each app from the dock; verify each renders real content (not "Coming Soon")
- [ ] Profile shows bio, contact, links
- [ ] Resume shows full work history; "Download PDF" downloads `resume.pdf`
- [ ] Projects shows IDEA / Sleepbar / re:Invent in left sidebar; clicking each shows detail
- [ ] Messages shows iMessage UI; submitting form returns 503 (no key) or 200 (if key set)
- [ ] Safari shows bookmarks bar + iframe
- [ ] Finder shows sidebar + icon view; double-click Resume.pdf opens PDF
- [ ] Settings shows Appearance + Wallpaper panes; clicking a wallpaper changes desktop bg live
- [ ] Calendar shows Cal.com iframe (or fallback link)
- [ ] TextEdit can be deeplinked: `http://localhost:3000/textedit?file=resume.mdx` shows content
- [ ] Calculator works: `7 - 3 - 1 = 3`. Type Konami sequence → Snake appears
- [ ] QR vCard widget visible top-right; click downloads `contact.vcf`
- [ ] Resume.pdf desktop icon downloads PDF; Projects folder icon opens Projects app
- [ ] Terminal `cat profile.mdx` shows real content
- [ ] Spotlight (click magnifier) launches apps via fuzzy search
- [ ] Menubar still works: Apple > Restart replays boot, App > About <App> shows description, File > Quit closes window

- [ ] **Step 3: Final commit**

```bash
git status
# If there are stray formatting changes from `bun run format`, commit them:
git diff --stat
[ -n "$(git diff)" ] && git add -A && git commit -m "chore: format pass after Plan 2"
```

- [ ] **Step 4: Tag**

```bash
git tag -a content-v0 -m "NateOS Plan 2 (app content) complete"
```

---

## Self-review

**Spec coverage check** vs `2026-05-03-nateos-portfolio-design.md`:

| Spec section | Plan task |
|--------------|-----------|
| §3 Audience use cases (resume deeplink, projects deeplink, contact) | T5, T8, T9, T10 |
| §6.3 Deeplinks for /resume, /projects/<slug>, /textedit?file= | T5, T8, T15 |
| §7.1 Sparse desktop (Resume.pdf shortcut + Projects folder) | T19 |
| §7.1 QR vCard widget | T17 |
| §8 Profile app | T2, T3 |
| §8 Resume app + PDF download | T4, T5, T6 |
| §8 Projects (IDEA, Sleepbar, re:Invent) | T7, T8 |
| §8 Messages w/ Resend + honeypot + rate limit | T9, T10 |
| §8 Safari bookmarks + iframe | T11 |
| §8 Finder sidebar + icon view + virtual filesystem | T12 |
| §8 Settings (Appearance + Wallpaper) | T13 |
| §8 Calendar (Cal.com embed) | T14 |
| §8 TextEdit MDX viewer | T15 |
| §8 Calculator + Snake easter egg | T16 |
| §9 Content model: profile/resume/projects/links | T1, T2, T4, T7, T11 |
| §9.4 /api/messages Resend integration | T10 |
| §9.7 Settings store / theme tokens (CSS variables) | T13 (partial — full retro lands in Plan 3) |
| Terminal `cat` reads real content | T18 |

**Deferred to Plan 3 (mobile + retro + polish):**
- Mobile bottom-tab single-window mode (§7.2)
- Retro Classic skin (§7.3)
- Easter eggs: Konami → "About this Mac" (Calculator-only Konami in this plan), force-quit dialog, Cmd+Opt+Esc, `theme classic` real impl, `sudo hire-me` (§8.1)
- Sentry / observability (§13)
- Settings: era toggle (only Appearance + Wallpaper in this plan)

**Placeholder scan:** No `TBD` / `TODO` / `implement later` patterns. Test code blocks all include actual assertions. Code blocks present in every step that touches code.

**Type consistency:** `Profile`, `Resume`, `Project`, `Bookmark`, `CalcState`, `Action`, `ChatMessage`, `SendBody`, `VfsEntry`, `AppearanceMode` — defined once and referenced consistently. `loadProfile/loadResume/loadProjects/loadProjectBody/loadLinks` exported from `lib/content/load.ts` and consumed by app data wrappers.

---

## Execution handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-04-nateos-app-content.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — fresh subagent per task, two-stage review, fast iteration. Best for ~20-task plans with mostly mechanical work.

**2. Inline Execution** — run tasks in this session using executing-plans, batch checkpoints.

**Which approach?**
