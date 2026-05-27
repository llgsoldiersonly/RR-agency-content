# Agency Social Content Engine — Handoff

> Read first. Captures the vision, the locked V1 scope, what's deferred to V2, how to run it,
> and what's next. Supersedes the earlier standalone HANDOFF.md.

Last updated: 2026-05-26
Owner: Jon (agency is attorney-owned)

---

## 1. What we're building

A multi-client engine that produces ~30 days of social content per attorney client — reels (15–30s),
carousels, statics, and 1–2 lead magnets/week — across **Instagram, TikTok, YouTube, Facebook, LinkedIn**.
Goal: **follower + average-view growth**. ~**100 clients** (mostly PI, criminal, family, lemon law; all states;
some bilingual EN/ES). Content is built around **the case types each attorney wants**, defined per client.

**Compliance:** deliberate owner decision — not a gate; offered as a feature to clients who ask. The one rule
kept regardless is an **accuracy** rule, not a bar rule: **never invent case results or testimonials** — cite
only the client's approved `results.md`.

---

## 2. Scope split (LOCKED)

### V1 — lean / local (BUILD NOW)
Runs **locally off Jon's Claude Max plan** via Claude Code. **No paid API, no Postiz, no BooSend.** ~$0 beyond
the subscription (+ optional stock/music sub).

- **Generate** with Claude Code (interactive = subscription usage, not metered API).
- **Render** carousels/statics locally (HTML→PNG) and reels locally with **Remotion** (free, compute only).
- **Review** via the static `preview.html` (per-item + per-slide notes, Approve / Request changes,
  Copy All Feedback, localStorage). Publish the file to free static hosting (Cloudflare/GitHub/Vercel) to get a
  **shareable link**; collect feedback; paste back into Claude Code to regenerate.
- **Post:** manual (download approved assets, post natively). No auto-publish, no funnel in V1.

**Two Max-plan gotchas:**
1. Usage is **shared across claude.ai + Desktop + Claude Code** on rolling ~5h windows + a weekly cap — fine for
   a pilot, not for 100 clients on autopilot (that's why V2 uses the API).
2. If an **`ANTHROPIC_API_KEY` env var is set, Claude Code bills the API instead of the subscription.** Keep it
   unset; decline the "continue with API credits" prompt to stay on-budget.

### V2 — deferred (the app)
Next.js + Supabase + Vercel. Adds everything that needs servers/money/non-technical users:
- **Anthropic API** for headless/automated generation (no manual trigger).
- **Postiz** — auto-publish, scheduling, per-channel analytics across all 5 platforms.
- **BooSend / ManyChat** — comment-to-DM funnel (keep the dependency swappable).
- **Creatify** automation (V1 uses it manually if at all).
- **Supabase-backed review** — `/review/<token>` links with persistent, aggregated, multi-reviewer
  approvals (vs V1 localStorage + copy-paste).
- Multi-tenant app, client + team logins, upload portal, analytics dashboard.
- The V1 per-client folders map ~1:1 to DB tables — nothing in V1 is wasted.

---

## 3. Phase-1 roles
- **Jon** = generation trigger (Claude Code on Mac; Remotion renders on Mac; maybe a dedicated Mac Studio later).
  Intentionally the bottleneck — fine for a 3–5 client pilot, does not survive 100. **Client count triggers V2.**
- **Non-technical SMM** = never touches the terminal. Drops client footage into a shared folder, fills intake,
  and (V1) posts approved assets by hand. Needs a **PDF walkthrough** (next deliverable).

---

## 4. Stack (with caveats found)

| Tool | Role | Notes |
|---|---|---|
| **Claude Max + Claude Code** | V1 generation | Subscription, not metered. Shared windowed usage; watch the API-key env var. |
| **Remotion** | Primary video (V1, local) | CapCut-killer: auto captions/branding/B-roll. Outputs H.264 1080×1920. Compute only, no fee. |
| **Creatify** | Optional AI-avatar fallback | Built for e-commerce URL→video; credit-metered; manual in V1, automate in V2. |
| **Postiz** (V2) | Publish/schedule/analytics | All 5 platforms; REST API + MCP; agency white-label. Self-host vs SaaS TBD. |
| **BooSend** (V2) | Comment-to-DM funnel | Live: IG/WhatsApp/Telegram. ~7 months old (launched Nov 1 2025) → single point of failure; keep swappable. |
| **ManyChat** (V2) | Proven funnel fallback | Meta Business Partner; IG comment-to-DM + WhatsApp (good for ES/LATAM audiences). |
| **Virlo.ai** | Competitor/trend/hook intel | API; TikTok/IG Reels/YT Shorts only (no LinkedIn/FB); credit-metered. |
| **Ahrefs** | YouTube/Google + local SEO | The only keywords that truly rank on Google. |
| **Storyblocks/Artgrid** | Licensed B-roll + music | Music matters: business accounts can't freely use trending audio. |

---

## 5. Repo (this scaffold)

```
agency-content-engine/
├─ clients/hartman-injury-law/     EXAMPLE client, filled end-to-end (clone for real clients)
│  ├─ brand.md results.md competitors.md keywords.md config.yml
│  ├─ assets/ (logo,fonts,headshots,broll,music,uploads)
│  ├─ calendar/2026-06.md          full 30-day plan
│  └─ content/2026-06/
│     ├─ content.json              7 sample items (2 reels, 2 carousels, static, lead magnet, 1 ES reel)
│     └─ preview.html              GENERATED review page (verified)
├─ templates/preview.template.html review UI (data injected at __INJECTED_DATA__)
├─ tools/generate-preview.mjs      content.json -> preview.html  (plain Node, no deps)
├─ skills/                         00-engine, hook-library, reel-script-writer, carousel-generator, calendar-generator
├─ remotion/                       local reel template + render commands (the CapCut-killer)
├─ README.md  HANDOFF.md  .gitignore
```

Run the review loop:
```bash
node tools/generate-preview.mjs clients/hartman-injury-law/content/2026-06/content.json
open clients/hartman-injury-law/content/2026-06/preview.html
```

`content.json` schema + the generation rules live in `skills/00-engine.md`. Reviewer notes key off stable item
`id`s — never renumber them.

---

## 6. Still to build / improve
- ~~SMM PDF walkthrough~~ — **DONE** → docs/SMM_Playbook_v1.pdf
- **Cross-platform adaptation** — 1 idea → native cuts (reel + YouTube + a distinct professional LinkedIn post).
- **Living hook library** — PBL hooks (legal-filtered) + Virlo real-time winners + each client's own winners.
- **Local B-roll shoot** per client at onboarding (owned footage, local relevance, keeps 100 clients distinct).
- ~~Real slide PNG rendering~~ — **DONE** → tools/render-slides.mjs (@napi-rs/canvas, 1080×1350 on-brand PNGs)
- Then the **V2 app** when client count forces SMM self-serve.

---

## 7. Open decisions
1. Postiz: self-host vs white-label SaaS (V2).
2. BooSend lifetime vs ManyChat for stability (keep swappable either way).
3. Render infra: Mac now → dedicated Mac Studio when always-on.
4. Build location: extend existing repo vs this fresh `clients/` structure.
5. V2 trigger: which client count forces SMM self-serve generation.

---

## 8. Next step
Either the **SMM PDF walkthrough**, or generate the **full 30-day `content.json`** for Hartman (the scaffold has
7 sample items + the full calendar) so you can review a complete month in the preview page.

## V1 build status — complete
- Per-client folder model + 30-day `content.json` ✓
- Review page + shareable-link feedback loop ✓
- 7 per-practice-area hook skills (controlled-tension / trust-safe) ✓
- Presales pitch generator (async link, animated reel) ✓
- Finished carousel PNG renderer — `tools/render-slides.mjs` ✓
- SMM playbook — `docs/SMM_Playbook_v1.pdf` ✓
- Production reel MP4 renderer wired — `remotion/render-reels.mjs` (bundles clean; renders on Mac) ✓

V1 is feature-complete. Next is V2: Postiz (scheduling/analytics), Anthropic API (headless generation),
BooSend/ManyChat (funnel), Supabase app shell.
