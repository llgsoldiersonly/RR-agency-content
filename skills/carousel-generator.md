# Skill: Carousel Generator

Output 5–10 slides into the item's `slides` array (each `heading` + `body`), plus `caption`,
`hashtags`, `cta`.

**Read `skills/carousel-writer/SKILL.md` first** — it governs slide-level design strategy
(slide roles, visual hierarchy, reading velocity, pattern interrupts, Brand Energy Profiles,
the "one idea per slide" rule). The rules here cover only what goes into `content.json`.

## Shape
- Slide 1 = the hook (cover). Big promise or sharp question — declare ONE hook type.
- Slides 2–N = one role per slide (mistake / framework / proof / checklist / payoff / ...).
- Last slide = CTA + save/share prompt.
- Pattern-interrupt every 2-3 slides (alternate light/dark, simplify layout, oversize text).
- Peak value lands on slides 4-7, not slide 1.

## Rules
- Carousels are for saves — make each slide quotable on its own (screenshotability).
- Numbers/results only from results.md.
- Keep body lines short enough to render on a 1080×1440 card (3:4 ratio).
- Default ratio: ~70% light slides / 30% dark slides — pattern interrupts in dark.
- Niche pacing comes from `Brand Energy Profiles` in carousel-writer/SKILL.md,
  overridden by the client's brand.md voice when they conflict.
