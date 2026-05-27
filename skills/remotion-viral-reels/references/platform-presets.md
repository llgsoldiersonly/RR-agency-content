# Platform Presets

The matrix in `motion-matrix.md` handles tier per platform. This file handles
**layout + tone** overrides per platform when you render a per-platform variant.

## Why per-platform variants
Cross-platform CTAs leak (a "DM us SETTLE" CTA on TikTok looks alien on LinkedIn). The same
script renders into N variants, each with the platform's overlay applied.

## TikTok
- Tier modifier: **+1**
- Right rail aggressive: clear x=900–1080 across y=540–1480
- Username bottom-left can crowd captions — keep caption block within x=160–860 on bottom captions
- CTA: "Comment WORD" style works (DM funnel)
- Hook visuals: pattern-interrupt and big-number do well here
- Cuts: fastest, 1.0–1.5s beat cadence

## Instagram Reels
- Tier modifier: **0**
- Caption-overlay text added by user lives at y=1380–1480 — keep bottom captions above this
- CTA: "Link in bio" or "Comment WORD"
- Hook visuals: punch-in, big-number, blur-to-focus all work
- Cuts: 1.5–2.0s beat cadence

## YouTube Shorts
- Tier modifier: **+1**
- Title strip lives at bottom — extra-tall danger zone (y > 1520)
- CTA: search-style works ("Search '<keyword>' on YouTube") — these reels live longer than 24h
- Hook should include the keyword in the first 3 seconds (Shorts are searchable)
- Hook visuals: punch-in or big-number (keyword-friendly)
- Cuts: 1.5–2.0s beat cadence

## Facebook Reels
- Tier modifier: **0**
- Similar layout to IG Reels; bottom danger 1500–1920
- CTA: warmer ("Send us a message" / native FB CTA button)
- Hook visuals: blur-to-focus and bold-caption resonate (older skew)
- Cuts: 2.0–2.5s beat cadence

## LinkedIn
- Tier modifier: **−1** (forces calmer treatment)
- Smaller UI overlay (less right-rail risk) but audience expects authority, not punch
- **Banned on LinkedIn:** shake (any tier), pattern-interrupt hook visual, "Comment WORD 👇" CTAs
- CTA: insight-oriented ("Full breakdown on our site" / "Connect with [attorney]")
- Hook: longer caption (up to 9 words) tolerated
- Hook visuals: punch-in (subtle), blur-to-focus, bold-caption
- Cuts: 2.0–3.0s beat cadence

## Voice mapping (from hook-library.md "platform tone modulation" — applies here too)
| Platform | Energy |
|---|---|
| TikTok | discovery — curiosity highest, fastest |
| IG Reels | familiarity — same energy, more branded |
| YT Shorts | searchable authority — lead with keyword |
| FB | local trust — warmer, protection-led |
| LinkedIn | referral network — Authority up, no Fear |

## Bilingual variants
- ES variants get **+1 tier** vs the EN version (Spanish-language audiences over-index on expressive motion)
- ES typically deploys to: Facebook, WhatsApp (via funnel), IG; less on LinkedIn
- Re-clamp after the +1 (don't exceed `hot`)
