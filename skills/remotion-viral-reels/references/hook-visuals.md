# Hook Visuals — the first 1.5 seconds

The script-level hook (`item.hook` from `content.json`) is the words. The hook visual is the
**treatment that delivers those words**. They are decided together.

`item.hookVisual` (optional, defaults to `punch-in`) selects one of these patterns.

## The 6 patterns

### 1. `punch-in` (default — works for 80% of items)
Hook text centers, punches in from scale 1.00 → tier-max in 8 frames, holds for ~2s, cuts.
Trust-safe across all areas. Match this to hooks like "Most people hurt their own claim…"

```
frame 0–8:   text appears at scale 1.00, springs to 1.08 (punchy)
frame 9–78:  text holds, optional subtle drift (1.08 → 1.05 over 60f)
frame 79+:   first body beat begins
```

### 2. `bold-caption` (text-only hook on solid color)
No B-roll. Hook fills the screen on a brand-dark background with brass highlight on the key word.
Best for: criminal, family, probate (calmer areas where stillness IS the hook).

### 3. `pattern-interrupt`
A short (0.2s) visual jolt before the hook lands — color flash, geometric wipe, or a
"caution stripe" frame. Then the hook caption appears.
Best for: PI, lemon law, workers' comp (punchy tiers). **Banned on conservative tier.**

### 4. `big-number`
The hook is a number (e.g., "3 mistakes", "24 hours", "$0 upfront"). Number reveals at giant
size (~280px) with a spring, then shrinks to make room for the hook caption underneath.
Best for: list-style hooks, statistic-driven hooks.
Rule: never invent the number — must come from `results.md`, `brand.md`, or be self-evidently true (e.g., "first 24 hours").

### 5. `before-after`
Vertical 50/50 split with two states (e.g., "what they tell you" / "what actually happens").
The labels animate in left-then-right.
Best for: MYTH pillar, lemon-law/workers'-comp righteous-outrage hooks.
Rule: both sides must be honest — no strawman on the "wrong" side.

### 6. `blur-to-focus`
Background footage starts blurred + dim, sharpens over 12 frames as the hook caption appears.
Subtle, premium feel.
Best for: AUTH pillar, LinkedIn, family-law trust building. Slower energy.

## Pattern × tier compatibility

| Pattern | conservative | medium | punchy | hot |
|---|---|---|---|---|
| punch-in | ✓ | ✓ | ✓ | ✓ |
| bold-caption | ✓ | ✓ | ✓ | ✓ |
| pattern-interrupt | ✗ banned | rare | ✓ | ✓ |
| big-number | ✓ | ✓ | ✓ | ✓ |
| before-after | ✓ | ✓ | ✓ | ✓ |
| blur-to-focus | ✓ | ✓ | rare | ✗ (too slow) |

## Trust-safe check (every hook visual)
The visual cannot:
- Imply a specific named victim/incident (no real news footage, no "based on a recent case…")
- Show outcome/dollar amounts not in `results.md`
- Shame the viewer visually (no "before-after" where the "before" is a person looking foolish)
- Use stock footage of identifiable people in crisis
