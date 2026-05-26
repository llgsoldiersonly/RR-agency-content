# Skill: Reel Script Writer (15–30s)

Write a tight vertical-reel script. Output into the item's `script` array as beats with
timecodes, plus `onscreen` text per beat, then `caption`, `hashtags`, `broll`, `cta`.

**Pair with `skills/remotion-viral-reels/SKILL.md`** — that skill governs visual rendering
(safe zones, motion, emphasis, hook visuals). This skill governs the words.

## Structure (≈22s)
- 0:00 HOOK — first line earns the next 3 seconds. Put it on screen too.
- 0:03 STAKES — why it matters to the viewer right now.
- 0:07–0:18 VALUE — 2–3 concrete, specific points. One idea per beat.
- 0:18 CTA — one ask (follow / link in bio / comment KEYWORD if funnel on).

## Rules
- Plain speech, short sentences, second person ("you").
- Every beat has on-screen text (most watch muted). 3–7 words per beat.
- Faceless reels: `broll` describes stock or the one-time local shoot; or note "Remotion text-only".
- Bilingual: write a parallel ES item with its own id (suffix `-es`), not a translation dump.
- No dollar claims unless in results.md. No "guarantee". No competitor names.

## Visual annotations to produce (governed by remotion-viral-reels)
For every beat in `script[]`, add:

- **`emphasis`** — array of 1–3 words from `onscreen` that carry the emotional/money/stakes weight.
  Reserve for: pain, money, time pressure, danger, contrast, surprise, numbers.
  Skip common words (the, a, you, to).

- **`motion`** — one of `punch-in | slow-tension | shake | pop | none`. Most beats = `none`.
  Use `punch-in` on emphasis beats. `pop` on the single most important word-moment (max once per reel).
  `shake` only on shock beats and **banned** on conservative-tier reels. See remotion skill `motion-rules.md`.

- **`position`** — `top | mid | bot`. Default `bot`. **Vary at least once per reel** (eye-fatigue defense).

At the **item level**, also add:

- **`hookVisual`** — `punch-in | bold-caption | pattern-interrupt | big-number | before-after | blur-to-focus`.
  Default `punch-in`. Match to the hook text + tier. See `hook-visuals.md` in the remotion skill.

- **`ctaSubline`** — short funnel line. `Link in bio` (default), `Comment <KEYWORD>` (when `dm_funnel: true`),
  or platform-native ("Search '<keyword>' on YouTube" for Shorts, "Connect with [attorney]" for LinkedIn).

- **`motionTier`** — leave UNSET unless you have a reason. The renderer computes it from
  `practiceArea × pillar × platform`. Override only when one specific reel needs a different feel
  than the matrix gives — and document why in a note.

## Example reel beat (PI MYTH item for TikTok)
```json
{
  "t": "0:08",
  "line": "If the adjuster calls before you're cleared, you don't have to answer.",
  "onscreen": "You don't have to answer that call",
  "emphasis": ["don't have to"],
  "motion": "punch-in",
  "position": "bot"
}
```

## Hook-visual selection cheat
- Mistake/curiosity hooks → `punch-in`
- Number-led hooks ("3 mistakes…", "first 24 hours") → `big-number`
- Myth-bust hooks ("what they tell you / what actually happens") → `before-after`
- Authority/trust hooks → `blur-to-focus` or `bold-caption`
- Punchy/righteous hooks (lemon-law, workers' comp) → `pattern-interrupt` if tier allows
