# Agency Social Content Engine — V1 (lean / local)

Generate a month of social content per attorney client, review it via a shareable
preview link, then post the approved assets by hand. Runs **locally off your Claude
Max plan** (via Claude Code) with **no paid API, no Postiz, no BooSend** — those are V2.

## What V1 does (and doesn't)
- **Does:** generate reels scripts + carousels + statics + lead magnets per client →
  render a review page → share a link → collect notes → regenerate. Reels render
  locally with Remotion. Costs ~$0 beyond your Max subscription.
- **Doesn't:** auto-publish, schedule, run the comment-to-DM funnel, or generate
  headlessly without you. All of that is V2 (see HANDOFF.md).

## Requirements
- Node 18+ (the preview generator is plain ESM, no dependencies)
- Claude Max plan + Claude Code (generation runs against your subscription)
- *(optional)* a stock/music subscription (Storyblocks/Artgrid) for B-roll
- *(for reels)* Remotion installed in `remotion/` (see `remotion/README.md`)

> **Stay on your subscription, not the metered API:** make sure no
> `ANTHROPIC_API_KEY` env var is set, or Claude Code will bill the API instead of
> your Max plan. Decline the "continue with API credits" prompt when you hit a limit.

## The V1 loop
```bash
# 1) generate / edit a client's month of content with Claude Code
#    (Claude reads the client folder + skills, writes content/<month>/content.json)

# 2) build the review page from the data
node tools/generate-preview.mjs clients/hartman-injury-law/content/2026-06/content.json

# 3) open it locally to check
open clients/hartman-injury-law/content/2026-06/preview.html   # macOS

# 4) share a LINK (publish the static file — not a server):
#    Cloudflare Pages / GitHub Pages / `vercel deploy` the preview.html.
#    Use an unguessable path so client drafts aren't publicly indexable.

# 5) reviewer leaves per-item + per-slide notes, sets Approve / Request changes,
#    clicks "Copy All Feedback", sends the bundle back. Paste it into Claude Code
#    to regenerate. Repeat until approved.

# 6) reels: render locally
cd remotion && npm run render -- Reel out/<id>.mp4 --props=../clients/.../content.json
```

## Add a new client
Copy `clients/hartman-injury-law/` to `clients/<new-slug>/`, then fill every file
(`brand.md`, `results.md`, `competitors.md`, `keywords.md`, `config.yml`). The
generators refuse to run on an incomplete `brand.md` / `config.yml`. See
`CLIENT_FOLDER_TEMPLATE` notes inside `brand.md`.

## Layout
```
clients/<slug>/        per-client knowledge folder + generated output
templates/             the review page template (data injected at __INJECTED_DATA__)
tools/                 generate-preview.mjs  (content.json -> preview.html)
skills/                Claude Code skills: brand reader, hooks, scripts, carousels, calendar
remotion/              local video render templates (the CapCut-killer)
HANDOFF.md             where the project is + what's deferred to V2
```

## Render finished carousel art (PNG)
```bash
npm install                 # one time — pulls @napi-rs/canvas (no browser needed)
node tools/render-slides.mjs clients/<slug>/content/<month>/content.json
# -> content/<month>/carousels/<itemId>/01.png ... (1080x1350, on-brand)
```
Drop the client's brand TTFs in `assets/fonts/` and they're used automatically; otherwise a clean
system-serif fallback is used. Brand colors / handle / tagline come from `content.json` `project`.

## SMM playbook
`docs/SMM_Playbook_v1.pdf` — the non-technical operator's guide (collect → review → post). Hand this
to the social media manager; they never touch the terminal.
