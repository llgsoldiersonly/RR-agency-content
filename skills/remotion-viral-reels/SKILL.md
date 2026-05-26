---
name: remotion-viral-reels
description: Use when writing, editing, or reviewing Remotion code for vertical short-form video — reels, TikToks, IG Reels, YouTube Shorts, Facebook Reels. Covers safe-zone layout, caption physics, emphasis-word treatment, motion intent, hook-visual patterns, and final render QA. Activate whenever a script becomes a video, or when Reel.tsx / its components are edited.
---

# Remotion Viral Reels — production skill

This skill turns a `script[]` from `content.json` into a 1080×1920 H.264 reel that is
**thumb-stopping, safe-zone-correct, and trust-safe**. It pairs with `skills/reel-script-writer.md`
(which decides WHAT to say) — this skill governs HOW it's rendered.

## Default specs
- Canvas: **1080 × 1920** (9:16)
- FPS: **30**
- Codec: **H.264**
- Duration: **8–45s** — match script timing
- Audio: licensed library only (business accounts can't use trending audio)
- First visible motion: **within 0.3s** (9 frames). Non-negotiable.

## The production pipeline — never skip a step
For every reel, in order:

1. **Read the script** — beats from `content.json` item's `script[]`.
2. **Mark emphasis** — per beat, pick 1–3 emotional/money/stakes/contrast words.
3. **Choose motion intent** per beat — see `references/motion-matrix.md`. NOT every beat moves.
4. **Place captions** — bottom default, vary to mid for rhythm. Always inside safe zone (`references/safe-zones.md`).
5. **Pick a hook visual** — see `references/hook-visuals.md`. Default = punch-in. Match trust-safe.
6. **Emit Remotion code** — use `templates/` components, not freehand divs.
7. **Run the QA checklist** — `checklists/final-render-qa.md`. If any item fails, stop and fix.

## Hard rules (read every time)
- **Safe zone:** important text never in top 320px, bottom 420px, or right 180px. See `references/safe-zones.md`.
- **Captions:** max **2 lines**, **3–7 words** per beat. Never paragraphs. See `references/caption-rules.md`.
- **Emphasis:** max **3 words** per beat get the emphasis treatment. Reserve it for stakes/money/contrast.
- **Motion:** one major effect at a time. Never combine shake + zoom + word-pop on the same beat unless it's the hook. See `references/motion-rules.md`.
- **No-sound test:** every reel must be understandable with sound off. If captions don't carry it, the reel fails.
- **SafeZoneOverlay:** ships in dev mode. Must NOT appear in final render (gated by `REMOTION_DEV_SAFEZONES=1`).
- **Tier-clamping:** the practice-area + pillar + platform combination clamps motion intensity. See `references/motion-matrix.md`. Never exceed the tier.

## Where to find what
- **Safe zones / forbidden regions / platform overlays** → `references/safe-zones.md`
- **Caption font, size, line breaks, emphasis-word rules** → `references/caption-rules.md`
- **Motion physics (durations, curves, frame counts)** → `references/motion-rules.md`
- **Which motion tier applies (the 3-dial matrix)** → `references/motion-matrix.md`
- **Hook visual patterns (punch-in, pattern-interrupt, etc.)** → `references/hook-visuals.md`
- **Per-platform overrides (LinkedIn vs TikTok)** → `references/platform-presets.md`
- **Reusable React components** → `templates/`
- **Final QA checklist** → `checklists/final-render-qa.md`

## Output expectations
When you write Remotion code from a script, produce:
1. A beat-by-beat **timing table** (frame ranges, motion intent, emphasis words)
2. The **Remotion code**, using `templates/` components
3. The **motion tier** you computed (e.g., `personal-injury × MYTH × tiktok → punchy`) with the inputs shown
4. The **safe-zone note** for any text placed outside the default caption zone
5. The **filled QA checklist** at the bottom

## Banned (visual)
- Slow intro motion (anything > 0.3s before first movement)
- Captions in the bottom 420px or behind the right rail
- More than 3 emphasis words per beat
- Word-by-word pop on every word (use sparingly — it dies fast)
- Random shakes / zooms without a hook or beat-change justifying them
- Tiny text (< 56px main caption, < 40px sub-caption)
- Bottom-anchored CTA below y=1500
- Combining shake + zoom + word-pop unless it's the hook

## Integration with V1 schema
The `content.json` per-beat shape is **backwards compatible**. Old reels render unchanged.
New optional fields per beat in `script[]`:

```json
{
  "t": "0:00",
  "line": "spoken line (optional, for voiceover)",
  "onscreen": "What viewers READ on screen",
  "emphasis": ["READ"],
  "motion": "punch-in | slow-tension | shake | pop | none",
  "position": "top | mid | bot"
}
```

New optional fields per item:
```json
{
  "hookVisual": "punch-in | big-number | before-after | pattern-interrupt | blur-to-focus | bold-caption",
  "motionTier": "conservative | medium | punchy | hot"  // overrides matrix if set
}
```

Defaults if absent: `motion: none`, `position: bot`, `hookVisual: punch-in`, `motionTier: computed-from-matrix`.
