// Project Reel composition. Thin shim around the production scaffold in
// skills/remotion-viral-reels/templates/ReelScaffold.tsx so the V1 schema
// (hook/beats/cta/brand + new optional fields) lands cleanly on the
// reusable templates.
import {
  ReelScaffold, FPS, reelDurationInFrames,
} from "../../skills/remotion-viral-reels/templates/ReelScaffold";
import {
  computeMotionTier, MotionTier, ScriptBeat, PracticeArea,
} from "../../skills/remotion-viral-reels/templates/types";
import type { HookVisualKind } from "../../skills/remotion-viral-reels/templates/HookVisuals";

export { FPS, reelDurationInFrames };

export type Beat = ScriptBeat;

export type ReelProps = {
  hook: string;
  hookVisual?: HookVisualKind;
  beats: Beat[];
  cta: string;
  ctaSubline?: string;
  brand: { navy: string; brass: string };
  footage?: string;
  music?: string;
  // Tier resolution — any one path works:
  tier?: MotionTier;                    // explicit override (item.motionTier)
  area?: PracticeArea;                  // computed via 3-dial matrix
  pillar?: string;                      // EDU | MYTH | AUTH | TRUST | LEAD
  platform?: string;                    // tiktok | instagram | youtube | facebook | linkedin
};

export const Reel: React.FC<ReelProps> = (props) => {
  const tier: MotionTier =
    props.tier
    ?? (props.area
        ? computeMotionTier(props.area, props.pillar ?? "EDU", props.platform ?? "instagram")
        : "medium");

  return (
    <ReelScaffold
      hook={props.hook}
      hookVisual={props.hookVisual ?? "punch-in"}
      beats={props.beats}
      cta={props.cta}
      ctaSubline={props.ctaSubline}
      brand={props.brand}
      tier={tier}
      footage={props.footage}
      music={props.music}
    />
  );
};
