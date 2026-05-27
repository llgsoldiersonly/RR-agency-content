# Safe Zones — 1080×1920 master canvas

Every reel exports for IG, TikTok, YT Shorts, FB Reels, LinkedIn. Each platform overlays UI
(captions, action buttons, profile chips) on top of your video. If important text lands
underneath, it disappears for the viewer. **Stay inside the universal safe zone by default.**

## Universal safe zone (use this when in doubt)
- `x`: 120 → 900    (right 180px reserved for platform action buttons)
- `y`: 360 → 1440   (top 360 reserved for chrome, bottom 480 for captions/CTA strip)

## Caption preferred area
- `x`: 120 → 900
- `y`: 720 → 1280
- Bottom captions sit at `y ≈ 1240–1380` (under the universal zone but above the bottom UI overlay)

## CTA preferred area
- `x`: 120 → 860
- `y`: 1180 → 1450
- **Never** below y=1500. The bottom 420px is unreliable across platforms.

## Forbidden zones (text/logos/faces NEVER here)
- **Top danger:** y = 0 → 320 (profile chip, follow button, sound badge)
- **Bottom danger:** y = 1500 → 1920 (caption strip, like/comment/share row, music chip)
- **Right rail:** x = 900 → 1080 across y = 500 → 1500 (TikTok/IG/YT engagement buttons)
- **Left margin:** x = 0 → 90 (gesture zones on some devices)

## Per-platform stricter zones (use when targeting one platform)
| Platform | Top danger | Bottom danger | Right rail | Notes |
|---|---|---|---|---|
| TikTok | 0–280 | 1480–1920 | 900–1080 × 540–1480 | Username appears bottom-left, can crowd captions |
| IG Reels | 0–300 | 1500–1920 | 920–1080 × 600–1480 | Caption-with-text overlay sits y=1380–1480 if user adds it |
| YT Shorts | 0–340 | 1520–1920 | 900–1080 × 480–1520 | Title strip lives at bottom — extra-tall danger zone |
| FB Reels | 0–320 | 1500–1920 | 920–1080 × 580–1480 | Similar to IG, slightly stricter top |
| LinkedIn | 0–240 | 1560–1920 | 920–1080 × 600–1500 | Smaller UI overlay — but audience expects calmer layout, not denser |

## SafeZoneOverlay component (dev only)
Use `templates/SafeZoneOverlay.tsx` to visually verify in `remotion studio`. Gate behind env:
```
REMOTION_DEV_SAFEZONES=1 npm run studio
```
The overlay MUST be removed (or env-gated) before final render. Never ship a reel with the overlay visible.

## Coordinate cheatsheet
```
(0,0)──────────────────────────────(1080,0)
│  TOP DANGER 0–320 (no important text)  │
├────────────────────────────────────────┤
│                                        │
│  USABLE — caption preferred y=720–1280 │
│                                        │
│  Right rail x=900+ avoid              ─┤
│                                        │
│  Bottom captions OK y=1240–1380       │
├────────────────────────────────────────┤
│  BOTTOM DANGER 1500–1920 (UI strip)    │
(0,1920)──────────────────────────(1080,1920)
```
