# Final Render QA Checklist

Run this **before** declaring a reel done. If any item fails, fix and re-render.
Paste the filled checklist as part of the reel's deliverable note.

## Specs
- [ ] Canvas is 1080×1920, 30fps, H.264
- [ ] Duration matches the script (no padding at start or end)

## Safe zone
- [ ] No important text in top 320px
- [ ] No important text in bottom 420px (y > 1500)
- [ ] No important text under the right rail (x > 900, y 500–1500)
- [ ] `SafeZoneOverlay` is hidden in the rendered output (env not set, or component removed)

## Captions
- [ ] Every caption is ≤2 lines
- [ ] Every caption is 3–7 words (or split into beats)
- [ ] No paragraph captions
- [ ] Line breaks happen at natural meaning boundaries, not character counts
- [ ] Font weight ≥ 700 on all visible text
- [ ] Captions vary position at least once across the reel (not all bottom)

## Emphasis
- [ ] No beat has more than 3 emphasis words
- [ ] Emphasis treatment is consistent per beat (one style at a time)
- [ ] Common words (the, a, you, to) are not emphasised
- [ ] At most one "pop" animation across the whole reel

## Motion
- [ ] First visible motion happens within 9 frames (0.3s)
- [ ] Motion changes at least every 2.5s
- [ ] No two motion effects on the same frame range (except in the hook)
- [ ] No shake on a conservative-tier reel
- [ ] Scale resets between beats (no creeping zoom across the whole reel)

## Tier compliance
- [ ] Computed tier shown in deliverable: `area × pillar × platform = tier`
- [ ] No motion exceeds the tier's max (e.g., no 1.10 punch on a medium-tier reel)
- [ ] If `motionTier` overrides the matrix, the reason is documented in the item

## Hook visual
- [ ] Hook visual matches a documented pattern in `references/hook-visuals.md`
- [ ] Pattern × tier is allowed (see compatibility table)
- [ ] Hook delivers within 1.5s — body beat #1 starts at ≤ frame 47

## Content / trust-safe
- [ ] No invented numbers, settlements, or local facts
- [ ] No absolute-villain framing
- [ ] No specific real event/victim referenced
- [ ] No viewer-shaming wording
- [ ] No outcome promises ("we'll win you…")

## Sound-off test
- [ ] Watch with sound off — does the reel still land? If not, captions are insufficient.

## CTA
- [ ] CTA is visible, centered, and above y=1500
- [ ] CTA text is short (one ask, ≤ 8 words)
- [ ] CTA subline matches the funnel state (`Link in bio`, `Comment KEYWORD`, etc.)
- [ ] CTA matches the platform (no "Comment WORD" on LinkedIn)

## Bilingual (if applicable)
- [ ] ES variant has its own id (suffix `-es`)
- [ ] ES variant is localized, not translated
- [ ] ES tier = EN tier + 1 (clamped) unless brand voice overrides
