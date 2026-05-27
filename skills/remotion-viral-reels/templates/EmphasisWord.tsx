import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { MotionTier } from "./types";

export type EmphasisTreatment = "color" | "color-size" | "underline-block" | "pop";

type Props = {
  word: string;
  accent: string;             // brand brass etc.
  treatment?: EmphasisTreatment;
  tier?: MotionTier;          // gates whether "pop" is allowed
  startFrame?: number;        // when the word appears (for pop animation)
};

// Renders a single emphasized word with the chosen treatment. Drop inline
// inside a CaptionBlock between regular text spans.
export const EmphasisWord: React.FC<Props> = ({
  word, accent, treatment = "color", tier = "medium", startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "pop" is gated — conservative tier never pops.
  const allowPop = treatment === "pop" && tier !== "conservative";
  const popScale = allowPop
    ? spring({
        frame: Math.max(0, frame - startFrame),
        fps,
        config: { damping: 14, stiffness: 160 },
        from: 0.96, to: 1.03, durationInFrames: 10,
      })
    : 1;

  const sizeBoost = treatment === "color-size" ? 1.1 : 1;
  const underline = treatment === "underline-block";

  return (
    <span
      style={{
        color: accent,
        fontSize: `${sizeBoost * 100}%`,
        display: "inline-block",
        transform: `scale(${popScale})`,
        transformOrigin: "center",
        background: underline ? `${accent}33` : undefined,
        padding: underline ? "0 8px" : undefined,
        borderRadius: underline ? 8 : 0,
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      }}
    >
      {word}
    </span>
  );
};
