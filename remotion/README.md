# Remotion reels — the production MP4 renderer (runs on your Mac)

Turns the **reels** in a client's `content.json` into 1080×1920 H.264 MP4s, in their brand colors.
Faceless by default (captions + motion over a navy background); can overlay captions on the
client's filmed footage. The MP4 render needs a headless browser, so run it on your Mac, not a server.

## Setup (once)
```bash
cd remotion
npm install          # pulls remotion + @remotion/bundler + @remotion/renderer (keep all @remotion/* on the SAME version)
```

## Preview a reel live (Remotion Studio)
```bash
npm run studio
```
Studio opens in the browser; edit props live and eyeball timing before rendering.

## Render a whole month of reels
```bash
node render-reels.mjs ../clients/hartman-injury-law/content/2026-06/content.json
# -> ../clients/<slug>/content/<month>/reels/<id>.mp4 for every reel + lead-magnet reel
```
Duration is computed from the number of script beats (hook + beats + CTA), so a 3-beat and a
6-beat reel come out the right length automatically.

## Faceless vs. real footage

### Faceless (default — no clip required)
Captions animate over the brand background. The "background" is no longer flat navy — the scaffold
layers a radial gradient, a subtle SVG noise grain, and a vignette so it reads as a produced shot,
not a colored slide. Good enough to ship without ever filming.

### Over real footage (the big visual lift)
1. Drop the clip in `remotion/public/` (e.g. `hartman-broll-traffic.mp4`).
2. Add `"footage": "hartman-broll-traffic.mp4"` to the reel item in `content.json`.
3. The scaffold auto-overlays a navy gradient so captions stay readable on any footage.

**Sourcing b-roll cheaply:**
- Pexels / Pixabay — free, license-permissive, plenty of intersection / highway / paperwork shots
- Storyblocks / Artgrid — paid but huge legal-relevant catalog
- Filmed by the firm — phone footage of their office, intake desk, signing, courthouse exterior

Aim for ~10s clips at 1080×1920 (or any resolution — Remotion downscales). Motion in the clip
(traffic, pen moving, door opening) reads as energy without competing with captions.

### Music
Same workflow: drop `track.mp3` in `remotion/public/`, add `"music": "track.mp3"` to the reel.

### Attorney brand chip
Set `project.attorney` in `content.json` (`{ "name": "Dana Hartman", "role": "Founding Attorney" }`)
and every reel renders a small top-left chip after the hook — works as the firm's station ID across
the whole month. Per-item `attorney` overrides the project default if you ever co-brand.

## Notes
- Output is H.264 (universally upload-friendly — better than the HEVC your CapCut export used).
- Display font is **Fraunces** (variable-weight serif, loaded via `@remotion/google-fonts`), used
  for hooks and the CTA card. Captions stay on Arial Black system stack — that's what reads as a
  native Reels/TikTok overlay.
