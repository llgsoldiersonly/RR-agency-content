import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { MotionIntent, MotionTier } from "./types";

type Props = {
  children: React.ReactNode;
  motion?: MotionIntent;     // "punch-in" | "slow-tension" | "shake" | "pop" | "none"
  tier?: MotionTier;
  background?: string;       // optional bg color/gradient behind children
};

// Per-tier scale max for punch-in / slow-tension. Driven from motion-rules.md.
const SCALE_MAX: Record<MotionTier, { punch: number; slow: number }> = {
  conservative: { punch: 1.04, slow: 1.03 },
  medium:       { punch: 1.06, slow: 1.05 },
  punchy:       { punch: 1.08, slow: 1.07 },
  hot:          { punch: 1.10, slow: 1.08 },
};

// Wraps a beat/section with a single motion effect. Compose around CaptionBlock
// or a hook visual. Never nest two ZoomBeats with motion on the same frame range.
export const ZoomBeat: React.FC<Props> = ({
  children, motion = "none", tier = "medium", background,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const max = SCALE_MAX[tier];

  let scale = 1;
  let translateX = 0;

  switch (motion) {
    case "punch-in":
      scale = interpolate(f, [0, 8], [1, max.punch], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      break;
    case "slow-tension":
      // 30–60f drift. Use composition length / 2 if available; default 45f window.
      scale = interpolate(f, [0, 45], [1, max.slow], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      break;
    case "pop": {
      if (tier === "conservative") break; // banned
      const s = spring({ frame: f, fps, config: { damping: 14, stiffness: 160 } });
      scale = 0.96 + s * 0.07;
      break;
    }
    case "shake": {
      if (tier === "conservative") break; // banned
      // 4–8 frames: -8 → +8 → -4 → 0 decay
      if (f < 8) {
        const seq = [-8, 8, -4, 4, -2, 0, 0, 0];
        translateX = seq[Math.min(f, seq.length - 1)];
      }
      break;
    }
    case "none":
    default:
      break;
  }

  return (
    <div
      style={{
        position: "absolute", inset: 0,
        transform: `translateX(${translateX}px) scale(${scale})`,
        transformOrigin: "center center",
        background,
      }}
    >
      {children}
    </div>
  );
};
