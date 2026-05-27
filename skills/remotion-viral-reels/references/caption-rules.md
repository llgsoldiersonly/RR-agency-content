# Caption Rules

Captions are the primary visual driver. ~80% of social video is watched muted —
**if your captions don't carry the reel, your reel fails.**

## Length
- **3–7 words** per caption beat (sweet spot: 4–5)
- **Max 2 lines** per beat. Ever. No exceptions.
- Long sentences → split into 2–3 sequential beats, not one wall-of-text caption.
- Break lines by **meaning**, never by character count.

✅ "Most people quietly hurt
their own claim."

❌ "Most people quietly hurt their own claim before they ever call a lawyer."

## Font defaults
- **Main caption:** 70–80px, weight 800–900 (Arial Black / Inter Black / Montserrat Black)
- **Hook:** 84–96px, weight 900, serif allowed for hooks (Georgia, Playfair) for authority feel
- **Emphasis word inside caption:** +10% size, accent color, optional pop animation
- **Sub-caption / tag:** 40–48px, weight 700
- **CTA:** 56–64px, weight 800

Line-height: 1.04–1.15 (tighter for hooks, looser for body)
Letter-spacing: -1 to -3px on large bold text
Text-align: center (default) or left (for list-style beats)

## Background treatment (must read on noisy footage)
Pick ONE; never stack:
- **Filled block** (default for body captions): solid color background, padding `14px 26px`, border-radius `16–24px`
- **Solid-color underlay strip** (for emphasis words inside text): tight underline-style block
- **Text shadow** (for hook-only): `0 4px 24px rgba(0,0,0,0.55)`
- **Heavy stroke** (avoid — looks amateur). Only use for hook captions on chaotic B-roll.

## Color contrast (must hit WCAG AA on the chosen tier)
- White text on brand-dark (e.g., `#0B2A4A`) = safe
- Brand-light text on dark video = needs shadow OR a filled block
- Never light-on-light. Never colored-on-colored without a block.

## Emphasis words (the engagement multiplier)
Per beat, mark 1–3 words that carry the emotional weight. Apply ONE treatment:

| Treatment | When |
|---|---|
| **Color swap** (white→brass) | Default. Use for stakes/money/contrast words |
| **Color swap + size +10%** | When the word IS the moment (e.g., "DON'T") |
| **Color swap + underline-block** | When the emphasis is a phrase (2–3 words) |
| **Pop animation** (scale 0.96→1.03→1.0 over 10f) | Use sparingly — once per reel max, on the single most important word |

Reserve emphasis for: pain, money, time pressure, danger, contrast, surprise, numbers.
**Don't emphasize common words** (the, a, to, you).

## Caption placement / position
- **Default:** bottom-anchored, `paddingBottom: 360`. Sits at y ≈ 1240–1380. Safe across platforms.
- **Mid:** y ≈ 720–960. Use for rhythm change in mid-reel. Good for "didn't think of this?" beats.
- **Top:** y ≈ 380–520. Use rarely — only when bottom is occupied by another element (e.g., a chart, a graphic).

**Vary position every 3–4 beats** to keep the eye moving. Never put 6 beats in a row at the same y.

## Anti-patterns
- ❌ Whole script as one paragraph block
- ❌ Thin fonts (anything < weight 700)
- ❌ Captions sitting under platform UI (y > 1500)
- ❌ Emphasizing every other word ("If YOU were JUST in a CRASH and DON'T know WHAT to do…")
- ❌ Lower-thirds with bars and corner ribbons — looks like a corporate webinar
- ❌ All-caps on body captions (OK on emphasis words only)
