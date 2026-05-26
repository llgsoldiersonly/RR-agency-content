# Motion Rules

Motion exists to drive retention, not to decorate. Every motion event must serve one of:
**hook**, **beat change**, **emphasis**, **CTA**. Random motion = motion sickness = scroll.

## The motion hierarchy
1. **Hook motion** — first 0.3s. The visual that says "stop scrolling." Strongest of the reel.
2. **Beat-change motion** — between captions. Pop-in or position shift. Keeps the eye reading.
3. **Emphasis-word motion** — within a caption. Scale/color pop on 1 word. Use sparingly.
4. **CTA motion** — final 2–4s. Spring scale-in on the end card.

Never combine more than one tier on the same frame range (except the hook, which can stack).

## First-motion rule
**Something must visibly change within 9 frames (0.3s @ 30fps).** This is the universal scroll-stop window.
Fades-in alone don't count — needs scale, slide, or color delta.

## Motion presets (use these — do not freehand frame counts)

### Punch-in (default emphasis zoom)
- Duration: **6–10 frames**
- Scale: `1.00 → 1.04` (conservative) | `1.00 → 1.06` (medium) | `1.00 → 1.08` (punchy) | `1.00 → 1.10` (hot)
- Curve: `interpolate` with `extrapolateLeft: "clamp"`, `extrapolateRight: "clamp"`
- Use: emphasis beats, hook reveals, CTA appearance

### Slow tension zoom
- Duration: **30–60 frames** (1–2s)
- Scale: `1.00 → 1.03` (conservative) | `1.00 → 1.05` (medium) | `1.00 → 1.07` (punchy)
- Use: serious-claim beats, "this is what matters" moments. NOT for hooks.

### Pop (caption / emphasis word)
- Duration: **10 frames**
- Scale: `0.96 → 1.03 → 1.00` (overshoot via spring)
- Use: emphasis word, caption beat-in. Max ONE per beat.
- Spring config: `{ damping: 14, stiffness: 160 }`

### Slide-in (caption appearance)
- Duration: **9 frames**
- Translate Y: `34 → 0` paired with opacity `0 → 1`
- Use: default caption appearance. This is the existing `fadeUp`.

### Impact shake
- Duration: **4–8 frames max**
- Translate X: `-8 → +8 → -4 → 0` (decay)
- Use: shock-word moments only. **Max once per reel.** Banned on conservative tier.

### Highlight sweep (over emphasis phrase)
- Duration: **12–18 frames**
- Background gradient that slides left→right behind the word(s)
- Use: when the emphasis is a 2–3 word phrase rather than one word

### Cut / reset
- Between beats, reset transforms to identity. Don't let scale "drift up" across the whole reel.

## Tier matrix (what each motion tier allows)

| Tier | Punch-in scale | Slow tension | Pop | Shake | Sweep | First-motion punch |
|---|---|---|---|---|---|---|
| **conservative** | 1.04 | yes (1.03) | no | **banned** | no | required |
| **medium** | 1.06 | yes (1.05) | yes (rare) | rare | OK | required |
| **punchy** | 1.08 | yes (1.07) | yes | yes (1×) | yes | required |
| **hot** | 1.10 | yes | yes | yes (2×) | yes | required + stack OK |

See `motion-matrix.md` for which tier applies based on practice area + pillar + platform.

## Beat-change cadence
- Default: a new caption / motion event **every 1.5–2.5s**
- Conservative tier: skew toward 2.5s (steadier, more authoritative)
- Punchy/hot: skew toward 1.0–1.5s (faster cuts)
- The end card runs 2.8s — don't put motion events in it after the spring lands

## Anti-patterns
- ❌ Endlessly zooming (camera never resets) — viewer gets seasick
- ❌ Motion on every word in a caption
- ❌ Shake without a reason (no shake on "and here's tip #4")
- ❌ Two springs running simultaneously (caption pop + emphasis pop on same frame)
- ❌ A fade-in that's the only motion in the first second (fails first-motion rule)
- ❌ Slow-tension zoom on the hook (kills the punch — use punch-in for hooks)
