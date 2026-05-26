# demos/ — presales pitch links (prospects, not clients)

Build a personalized sample to send a prospect BEFORE they sign. Reuses the hook skills,
calendar generator, and content schema; only the framing is different (sales, not review).

## Make one (≈2 min)
1. **Scrape the prospect's website to pre-fill prospect.yml + grab their logo:**
   `node tools/scrape-prospect.mjs https://<their-site> [<slug>]`
   - writes `demos/<slug>-demo/prospect.yml` with firm name, theme color, phone, city, practice area
   - downloads their best logo candidate to `demos/<slug>-demo/assets/logo.<ext>`
   - fields the scraper couldn't determine are marked `<FILL IN>` — review before sending
2. Complete `prospect.yml` — attorney name, agency info, case type, local notes.
3. Have Claude Code generate `pitch-content.json` from prospect.yml + skills/hooks/<area>.md:
   - full 30-day **plan** (titles only — proves strategy)
   - **2 carousels + 1 headless reel**, fully written, personalized + locally anchored
   - keep it to plan-plus-3: enough to prove quality, not a free month
4. `node tools/generate-pitch.mjs demos/<slug>-demo/pitch-content.json`
5. Publish `pitch.html` to a static host (Cloudflare/Netlify/Vercel) at an **unguessable path**.
   - One link = one prospect -> the host's view count is free open-tracking. 4 opens last night = call today.
6. Send the link. The page auto-plays the reel and ends in one CTA. Async by design.

### Why the scraper helps you sell
The pitch page renders the prospect's **logo** in the outro and uses their **brand color** as the
primary accent. When they open the link, they see their firm's identity — not a generic template.
That delta is what makes the pitch land. The scraper does ~20 min of manual data entry in 5 seconds;
you only fill the things a homepage can't tell you (attorney name, your agency CTA, local color).

## V1 limits (by design)
- No server: any notes a prospect types don't come back to you — the page drives the CTA + an
  optional "email us a note" mailto. Real feedback capture, notify-on-open, and link expiry are V2.
