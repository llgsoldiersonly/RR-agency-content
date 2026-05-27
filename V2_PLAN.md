# V2 Plan — the app

> Turns the V1 engine (per-client folders + Claude Code generation + static links) into a
> multi-tenant web app so the 25-person team and ~100 clients self-serve: upload → generate →
> review/approve → schedule/publish → measure. Nobody touches a terminal.
> **Nothing from V1 is thrown away** — the folder model, skills, review/pitch pages, and renderers
> all port in (see §9).

Last updated: 2026-05-26

---

## 1. When to start (the trigger)
V1 keeps you the generation bottleneck — fine for a 3–5 client pilot, fatal at 100. The day the SMM
must self-serve generation (instead of waiting on you) is the day V2 has to exist. **Validate content
quality on 2–3 real clients in V1 first.** Don't build the app around content you haven't proven.

## 2. Architecture (the spine)
- **Next.js 15 (App Router) on Vercel** — UI + API routes / server actions.
- **Supabase** — Postgres (data), Auth (team + client logins), **Row-Level Security** (per-client
  isolation), Storage (uploaded footage + rendered PNGs/MP4s).
- **Anthropic API (server-side, metered)** — replaces interactive Claude Code for headless generation.
  The V1 skills become prompt modules. *(This is the metered cost V1's Max plan hid.)*
- **Render workers** — Remotion (reels) + the canvas slide renderer (carousels) run as **queued jobs**
  on a render box or Remotion Lambda. **Not** Vercel serverless — it can't render video well.
- **Postiz** — scheduling, publishing, and analytics across the 5 platforms (REST API).
- **BooSend / ManyChat** — comment-to-DM funnel (kept swappable).

## 3. Data model (Supabase) — ports from the V1 folders
| Table | From V1 | Notes |
|---|---|---|
| `orgs` / `users` / `roles` | — | team auth; roles: Creator, Dept Head, Approver/Client, SMM, Admin |
| `clients` | `brand.md` + `config.yml` | brand fields, service area, languages, colors, handle, tagline |
| `local_intel` | Local Intelligence Profile | hard vs soft split preserved |
| `results` | `results.md` | approved-results / anti-fabrication source |
| `competitors`, `keywords` | those files | per-platform keywords |
| `content_items` | `content.json` items | type, pillar, language, hook, script/slides, caption, cta, **tags**, status |
| `assets` | `assets/` + rendered output | footage uploads + PNG/MP4 in Storage; status |
| `feedback` | the review page's notes | **persistent + multi-reviewer** (vs V1 localStorage) |
| `schedules` | — | per item × platform: time, status, Postiz id |
| `analytics_snapshots` | — | followers / views / reach over time |
| `prospects` + `pitch_links` | `demos/` | link token, **open count**, lead status |
| `jobs` | — | generation + render queue |

RLS scopes every row by `client_id` / `org_id`; clients see only their own.

## 4. The three durable services (headless, reusable)
1. **Generation** — client context (brand + results + local_intel + keywords) + month/pillar plan →
   Anthropic API with the V1 skill prompts (hook engine + per-area + script/carousel/calendar) →
   `content_items` (tagged, trust-safe). *This is the V1 skills ported to prompts.*
2. **Render** — `content_items` → media. Carousels via the canvas renderer → PNGs to Storage; reels via
   Remotion (Lambda / render box) → MP4 to Storage. Queue-based.
3. **Publish + measure** — Postiz: push approved scheduled items; pull per-channel analytics into
   `analytics_snapshots`.

## 5. App surfaces (UI)
- **Team app** — client list; content board (Kanban by status: idea→script→asset→review→scheduled→
  posted→measured); "Generate <month> for <client>" trigger; the 3-tier approval queue
  (Creator → Dept Head → Client); drag-and-drop footage upload; asset library; schedule view;
  **analytics dashboard** (follower + average-view growth per client/month — the month-end metric).
- **Client portal** — review/approve their content, leave persistent feedback, see calendar +
  analytics, upload their own footage.
- **Presales** — `/pitch/<token>` becomes DB-backed: real open-tracking + notify-on-open + lead status;
  reps generate from an in-app form.
- **SMM cockpit** — the non-technical operator's view: upload, review, schedule. Replaces the V1 PDF
  playbook workflow + manual posting.

## 6. Milestones (sequenced by value — MVP the app, don't boil the ocean)
- **V2.0 — internal core loop (kills the bottleneck).** Auth + multi-tenant + RLS; `clients` /
  `content_items` schema; port generation to the API; upload portal; review/approve UI (DB-backed
  version of the V1 page); render jobs (carousels + reels). Team-only, no publishing yet. *Goal:
  generate → review → approve → export in-app for 2–3 pilot clients.*
- **V2.1 — publish + measure.** Postiz: schedule + auto-publish across 5 platforms; analytics
  ingestion; the month-end dashboard. Client logins + client-facing review + analytics.
- **V2.2 — funnel + presales + scale.** BooSend/ManyChat comment-to-DM; DB-backed pitch links with
  open-tracking; onboarding flow (intake → tenant); the cross-platform adaptation layer (1 idea → 5
  native cuts) productized; living hook library fed by Virlo + the performance tags.
- **V2.3+ — the intelligence moat.** Correlate the classification tags against real analytics to learn
  what wins by practice area / city / platform, and feed it back into generation weighting. The
  long-term moat — only possible once volume + analytics exist.

## 7. De-risk first (spikes before they're load-bearing)
- **Postiz spike** — prove draft push + scheduling + analytics pull across all 5 platforms, and the
  OAuth onboarding flow for 100 client accounts. Decide **self-host (Docker) vs white-label SaaS**.
- **Render infra spike** — Remotion Lambda vs dedicated render box; throughput + cost for ~16 reels ×
  100 clients/month plus the canvas slides.
- **Generation-parity spike** — confirm the server-side API prompts match interactive Claude Code
  quality on the same client *before* betting the app on it. This is the most under-estimated risk.
- **Auth/RLS spike** — the 3-tier approval + per-client isolation in Supabase RLS.

## 8. Cost model at 100-client scale (size this before committing)
The real monthly burn V1 hid: **Anthropic API** tokens (~98 assets × 100 clients of generation,
batch where possible), **render compute** (~1,600 reels/month on Lambda + cheap canvas slides),
**Supabase storage** (footage + MP4s for 100 clients adds up fast — consider object storage / CDN for
rendered media), **Postiz** tier, **Vercel**, **Virlo** credits, **BooSend/ManyChat** seats. Model it
before you build, not after.

## 9. What ports directly from V1 (nothing wasted)
- Folder schema → DB tables · Skills (hook engine, per-area, script/carousel/calendar) → generation
  prompts · `preview.template.html` → review route · `pitch.template.html` → `/pitch/<token>` ·
  `render-slides.mjs` → carousel render service · `remotion/` → reel render service · SMM playbook →
  in-app onboarding/help · the classification **tags** → the analytics-correlation moat.

## 10. Open decisions (carried from HANDOFF)
1. Postiz self-host (Docker) vs white-label SaaS.
2. BooSend lifetime vs ManyChat (keep swappable either way).
3. Render infra: Remotion Lambda vs a dedicated Mac Studio / render box.
4. Single-org-multi-client (just LLG) vs multi-org (if you'd ever resell the platform). Likely the
   former for now — but RLS makes the latter cheap to add.
5. Build location: almost certainly a **new repo** (the Next.js app is a different shape than the V1
   tooling repo), importing the skills/prompts + renderers from V1.

---

### First concrete step when you start V2
Stand up the Supabase schema (§3) + auth/RLS, port the generation service (§4.1) behind one API route,
and rebuild the review page as a DB-backed route — then run a pilot client through generate→review→
approve in-app. That's V2.0; everything else hangs off it.
