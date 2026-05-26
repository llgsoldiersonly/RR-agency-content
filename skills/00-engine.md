# Skill: Content Engine (read me first)

You generate a month of social content for ONE attorney client, then build a review page.

## Procedure
1. Read the client folder: `brand.md` (incl. Local Intelligence Profile), `results.md`,
   `competitors.md`, `keywords.md`, `config.yml`. If `brand.md` or `config.yml` is incomplete, STOP.
2. Use `calendar-generator` to plan the month (or read an existing `calendar/<month>.md`).
3. For hooks, read `hooks/hook-library.md` (shared model) THEN the practice-area file
   `skills/hooks/<area>.md`. Use `reel-script-writer` / `carousel-generator` for the body.
   Pull local specifics from the Local Intelligence Profile; pull any results from `results.md`.
4. Write everything into `content/<month>/content.json` (schema below), including `tags`.
5. Run `node tools/generate-preview.mjs clients/<slug>/content/<month>/content.json`.
6. Hand the user the preview path; they publish it as a link and collect feedback.
7. On feedback, edit only the flagged items in `content.json` and re-run step 5.

## Hard rules
- **Accuracy:** never invent settlements, verdicts, dollar figures, testimonials, OR local facts.
  Cite only what's in `results.md` and the Local Intelligence Profile. If empty, leave it out.
- **Trust-safe tension:** activate mistakes/stakes/curiosity; never name an absolute villain,
  promise outcomes, hijack a real event, or shame the viewer. (See hook-library.md rewrite rule.)
- **Voice & weighting:** obey `brand.md` voice + the practice-area trigger weighting + platform overlay.
- **Bilingual:** if `languages` includes `es`, produce localized ES variants for EDU + LEAD items.
- **CTAs:** rotate from `brand.md`. DM-keyword CTAs only if `config.yml` `dm_funnel: true`.

## content.json schema
```json
{
  "project": { "client": "", "clientSlug": "", "month": "YYYY-MM", "generatedAt": "" },
  "items": [
    {
      "id": "kebab-id", "type": "reel|carousel|static|lead-magnet",
      "pillar": "EDU|MYTH|AUTH|TRUST|LEAD", "language": "en|es",
      "name": "", "platforms": ["instagram","tiktok","youtube","facebook","linkedin"],
      "hook": "",
      "script": [ { "t": "0:00", "line": "", "onscreen": "" } ],
      "slides": [ { "heading": "", "body": "" } ],
      "visual": "", "resource": "", "dmKeyword": "", "flow": [""],
      "caption": "", "hashtags": [""], "broll": "", "cta": "",
      "tags": { "trigger": "", "hookType": "", "funnelStage": "", "localRelevance": "", "platformFit": [""], "perfGoal": "" }
    }
  ]
}
```
Use only the fields a type needs. IDs are stable — reviewer notes key off them; never renumber.
