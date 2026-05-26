# Motion Matrix — the 3-dial computation

Motion intensity is **computed**, not chosen. Three inputs combine into one tier.

```
final_tier = clamp(
  baseline[area] + pillar_modifier[pillar] + platform_modifier[platform],
  [conservative, medium, punchy, hot]
)
```

Same mental shape as the trigger weighting matrix in `hook-library.md`. You only learn it once.

## Step 1 — area baseline
Read from `skills/hooks/<area>.md` (each area file declares its `motion_baseline`).
Defaults if the area file doesn't declare one:

| Practice area | Baseline | Why |
|---|---|---|
| Personal injury | **medium** | Trust-safe urgency tolerated; viewers are activated already |
| Criminal | **medium** | Stakes are high; punch reinforces gravity but not panic |
| Family | **conservative** | Sensitive audience; calm voice builds trust faster than punch |
| Lemon law | **medium** | Righteous-outrage energy; punch matches the "you've been wronged" framing |
| Immigration | **conservative** | Vulnerable audience; hope/protection > urgency. Calm = safe |
| Probate | **conservative** | Grief-adjacent audience; calm > everything |
| Workers' comp | **medium** | Similar to lemon law — righteous, not scary |

Encoded literally in each area file as `motion_baseline: conservative|medium|punchy|hot`.

## Step 2 — pillar modifier
From the item's `pillar` field in `content.json`:

| Pillar | Modifier | Why |
|---|---|---|
| EDU | **−1** | Educational tone reads better with calmer treatment |
| TRUST | **−1** | Trust-building (week in office, results) — earnest > punchy |
| MYTH | **0** | Myth-busting can hold the baseline |
| AUTH | **0** | Authority needs steadiness, not heat |
| LEAD | **+1** | Lead magnets need conversion energy |

## Step 3 — platform modifier
From the item's `platforms[]` — if multiple, render per-platform variants with this modifier:

| Platform | Modifier |
|---|---|
| LinkedIn | **−1** |
| Facebook | **0** |
| Instagram | **0** |
| YouTube Shorts | **+1** |
| TikTok | **+1** |

## Step 4 — clamp
Tiers, in order: `conservative (0) → medium (1) → punchy (2) → hot (3)`.

Sum the modifiers. Clamp to [0, 3]. Map back to the tier name.

```
example: personal-injury (medium=1) × MYTH (0) × tiktok (+1) = 2 = punchy
example: family (conservative=0) × EDU (−1) × linkedin (−1) = −2 → 0 = conservative
example: lemon-law (medium=1) × LEAD (+1) × tiktok (+1) = 3 = hot
example: probate (conservative=0) × TRUST (−1) × facebook (0) = −1 → 0 = conservative
```

## Step 5 — emit the inputs in your output
When you generate a reel, **state the computation** so reviewers can verify:

```
Motion tier: punchy
  ├─ area: personal-injury (medium = 1)
  ├─ pillar: MYTH (0)
  └─ platform: tiktok (+1)
  → sum 2 → punchy
```

## Per-item override
A `content.json` item can override the matrix with `motionTier: "conservative"` (etc.).
Use when a specific reel needs a different feel than the matrix would compute (rare — document why).

## What each tier actually unlocks
See `motion-rules.md` — the tier matrix table. Quick reference:

| Tier | Hook punch | Word pops | Shake | Slow zoom | Sweep |
|---|---|---|---|---|---|
| conservative | 1.04 | no | banned | yes (1.03) | no |
| medium | 1.06 | rare | rare | yes (1.05) | OK |
| punchy | 1.08 | yes | yes (1×) | yes (1.07) | yes |
| hot | 1.10 | yes | yes (2×) | yes | yes |

## Bilingual note
ES variants typically run **+1** vs the EN version of the same item (Spanish-language social
audiences over-index on more expressive motion). Apply this AFTER clamp, then re-clamp.
If brand voice in `brand.md` says otherwise, brand wins.
