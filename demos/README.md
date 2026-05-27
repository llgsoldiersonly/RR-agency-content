# demos/ — presales pitch links (prospects, not clients)

Build a personalized sample to send a prospect BEFORE they sign. Reuses the hook skills,
calendar generator, and content schema; only the framing is different (sales, not review).

## Make one (≈2 min)
1. Copy a demo folder: `cp -r demos/vega-injury-demo demos/<prospect-slug>`
2. Edit `prospect.yml` (firm, city, practice area, brand color, one case type).
3. Have Claude Code generate `pitch-content.json` from prospect.yml + skills/hooks/<area>.md:
   - full 30-day **plan** (titles only — proves strategy)
   - **2 carousels + 1 headless reel**, fully written, personalized + locally anchored
   - keep it to plan-plus-3: enough to prove quality, not a free month
4. `node tools/generate-pitch.mjs demos/<prospect-slug>/pitch-content.json`
5. Publish `pitch.html` to a static host (Cloudflare/Netlify/Vercel) at an **unguessable path**.
   - One link = one prospect -> the host's view count is free open-tracking. 4 opens last night = call today.
6. Send the link. The page auto-plays the reel and ends in one CTA. Async by design.

## V1 limits (by design)
- No server: any notes a prospect types don't come back to you — the page drives the CTA + an
  optional "email us a note" mailto. Real feedback capture, notify-on-open, and link expiry are V2.
