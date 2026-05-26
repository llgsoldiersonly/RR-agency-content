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
- **Faceless (default):** nothing to do — captions animate over the brand background.
- **Over client footage:** drop the clip in `remotion/public/` and add `"footage": "clip.mp4"` to the
  reel item in `content.json`. Same for a licensed track via `"music": "track.mp3"`.

## Notes
- Output is H.264 (universally upload-friendly — better than the HEVC your CapCut export used).
- Brand fonts: the demo uses system serif/sans. To use the firm's fonts, load them with
  `@remotion/google-fonts` or a local `@font-face` and swap the `fontFamily` values in `src/Reel.tsx`.
