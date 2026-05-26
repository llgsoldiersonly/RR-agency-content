// Shared types used by skill templates and the upgraded Reel.tsx.
// Matches the optional fields documented in SKILL.md "Integration with V1 schema".

export type MotionTier = "conservative" | "medium" | "punchy" | "hot";

export type MotionIntent = "punch-in" | "slow-tension" | "shake" | "pop" | "none";

export type CaptionPosition = "top" | "mid" | "bot";

export type HookVisualKind =
  | "punch-in" | "bold-caption" | "pattern-interrupt"
  | "big-number" | "before-after" | "blur-to-focus";

// Per-beat shape inside content.json item.script[]
export type ScriptBeat = {
  t?: string;
  line?: string;
  onscreen?: string;
  emphasis?: string[];
  motion?: MotionIntent;
  position?: CaptionPosition;
};

// Practice-area defaults — keep in sync with skills/hooks/<area>.md `motion_baseline`.
export type PracticeArea =
  | "personal-injury" | "criminal" | "family" | "lemon-law"
  | "immigration" | "probate" | "workers-comp";

export const AREA_BASELINE: Record<PracticeArea, number> = {
  "personal-injury": 1,  // medium
  "criminal":        1,
  "family":          0,  // conservative
  "lemon-law":       1,
  "immigration":     0,
  "probate":         0,
  "workers-comp":    1,
};

export const PILLAR_MOD: Record<string, number> = {
  EDU: -1, TRUST: -1, MYTH: 0, AUTH: 0, LEAD: +1,
};

export const PLATFORM_MOD: Record<string, number> = {
  linkedin: -1, facebook: 0, instagram: 0, youtube: +1, tiktok: +1,
};

const TIERS: MotionTier[] = ["conservative", "medium", "punchy", "hot"];

export function computeMotionTier(
  area: PracticeArea, pillar: string, platform: string,
): MotionTier {
  const sum =
    (AREA_BASELINE[area] ?? 1) +
    (PILLAR_MOD[pillar] ?? 0) +
    (PLATFORM_MOD[platform.toLowerCase()] ?? 0);
  const clamped = Math.min(TIERS.length - 1, Math.max(0, sum));
  return TIERS[clamped];
}
