import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { MotionTier } from "./types";

type CommonProps = {
  text: string;
  brass: string;
  navy: string;
  tier?: MotionTier;
  emphasis?: string[];      // words to highlight inside `text`
};

const SCALE_MAX: Record<MotionTier, number> = {
  conservative: 1.04, medium: 1.06, punchy: 1.08, hot: 1.10,
};

// ─── 1. punch-in ────────────────────────────────────────────────────────
export const HookPunchIn: React.FC<CommonProps> = ({ text, brass, navy, tier = "medium" }) => {
  const f = useCurrentFrame();
  const max = SCALE_MAX[tier];
  const scale = interpolate(f, [0, 8], [1, max], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const drift = interpolate(f, [9, 78], [max, max * 0.97], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = interpolate(f, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "90px 180px" }}>
      <h1 style={{
        opacity, transform: `scale(${f < 9 ? scale : drift})`,
        color: "#fff", fontFamily: "Georgia, 'Times New Roman', serif",
        fontWeight: 900, fontSize: 92, lineHeight: 1.04, textAlign: "center", margin: 0, maxWidth: 720,
      }}>
        {text}
      </h1>
    </AbsoluteFill>
  );
};

// ─── 2. bold-caption (text-only, no motion beyond fade) ──────────────────
export const HookBoldCaption: React.FC<CommonProps> = ({ text, brass, navy }) => {
  const f = useCurrentFrame();
  const opacity = interpolate(f, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: navy, justifyContent: "center", alignItems: "center", padding: "90px 180px" }}>
      <h1 style={{
        opacity, color: "#fff", fontFamily: "Georgia, serif", fontWeight: 900,
        fontSize: 96, lineHeight: 1.05, textAlign: "center", margin: 0, maxWidth: 720,
      }}>
        {text}
      </h1>
    </AbsoluteFill>
  );
};

// ─── 3. pattern-interrupt (banned on conservative tier) ──────────────────
export const HookPatternInterrupt: React.FC<CommonProps> = ({ text, brass, navy, tier = "medium" }) => {
  const f = useCurrentFrame();
  if (tier === "conservative") return <HookBoldCaption text={text} brass={brass} navy={navy} />;
  const flashOpacity = interpolate(f, [0, 3, 6], [1, 1, 0], { extrapolateRight: "clamp" });
  const textOpacity = interpolate(f, [6, 12], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: brass, opacity: flashOpacity }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "90px 180px" }}>
        <h1 style={{
          opacity: textOpacity, color: "#fff", fontFamily: "Georgia, serif",
          fontWeight: 900, fontSize: 92, lineHeight: 1.04, textAlign: "center", margin: 0, maxWidth: 720,
        }}>
          {text}
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── 4. big-number (text MUST start with a number) ───────────────────────
export const HookBigNumber: React.FC<CommonProps> = ({ text, brass, navy, tier = "medium" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const match = text.match(/^([\$\d.,kKmM+]+)\s+(.*)$/);
  const num = match ? match[1] : text.split(" ")[0];
  const rest = match ? match[2] : text.split(" ").slice(1).join(" ");
  const s = spring({ frame: f, fps, config: { damping: 12, stiffness: 140 } });
  const numScale = 0.6 + s * 0.4;          // 0.6 → 1.0
  const restOpacity = interpolate(f, [15, 24], [0, 1], { extrapolateRight: "clamp" });
  const max = SCALE_MAX[tier];
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "60px 180px" }}>
      <div style={{
        transform: `scale(${numScale * max})`, color: brass,
        fontFamily: "Georgia, serif", fontWeight: 900, fontSize: 280, lineHeight: 1,
      }}>{num}</div>
      <div style={{
        opacity: restOpacity, color: "#fff", marginTop: 24,
        fontFamily: "Georgia, serif", fontWeight: 800, fontSize: 76, lineHeight: 1.08,
        textAlign: "center", maxWidth: 720,
      }}>{rest}</div>
    </AbsoluteFill>
  );
};

// ─── 5. before-after (text expected as "A | B") ──────────────────────────
export const HookBeforeAfter: React.FC<CommonProps> = ({ text, brass, navy }) => {
  const f = useCurrentFrame();
  const [a = "Before", b = "After"] = text.split("|").map((s) => s.trim());
  const aOp = interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const bOp = interpolate(f, [10, 18], [0, 1], { extrapolateRight: "clamp" });
  const cell: React.CSSProperties = {
    flex: 1, display: "flex", justifyContent: "center", alignItems: "center",
    padding: "60px 180px", color: "#fff", fontFamily: "Georgia, serif", fontWeight: 900,
    fontSize: 72, textAlign: "center", lineHeight: 1.1,
  };
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ ...cell, opacity: aOp, background: `${navy}` }}>{a}</div>
      <div style={{ height: 4, background: brass }} />
      <div style={{ ...cell, opacity: bOp, background: `${navy}dd` }}>{b}</div>
    </AbsoluteFill>
  );
};

// ─── 6. blur-to-focus (subtle, premium) ──────────────────────────────────
export const HookBlurToFocus: React.FC<CommonProps> = ({ text, brass, navy }) => {
  const f = useCurrentFrame();
  const blur = interpolate(f, [0, 12], [16, 0], { extrapolateRight: "clamp" });
  const opacity = interpolate(f, [4, 14], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "90px 180px" }}>
      <h1 style={{
        opacity, filter: `blur(${blur}px)`, color: "#fff",
        fontFamily: "Georgia, serif", fontWeight: 900, fontSize: 92,
        lineHeight: 1.05, textAlign: "center", margin: 0, maxWidth: 720,
      }}>
        {text}
      </h1>
    </AbsoluteFill>
  );
};

// dispatcher used by Reel.tsx
export type HookVisualKind =
  | "punch-in" | "bold-caption" | "pattern-interrupt"
  | "big-number" | "before-after" | "blur-to-focus";

export const HookVisual: React.FC<CommonProps & { kind: HookVisualKind }> = ({ kind, ...rest }) => {
  switch (kind) {
    case "bold-caption":     return <HookBoldCaption {...rest} />;
    case "pattern-interrupt":return <HookPatternInterrupt {...rest} />;
    case "big-number":       return <HookBigNumber {...rest} />;
    case "before-after":     return <HookBeforeAfter {...rest} />;
    case "blur-to-focus":    return <HookBlurToFocus {...rest} />;
    case "punch-in":
    default:                 return <HookPunchIn {...rest} />;
  }
};
