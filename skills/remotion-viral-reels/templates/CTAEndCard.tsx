import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  cta: string;
  brass: string;
  navy: string;
  subline?: string;    // e.g. "Link in bio" or "Comment KEYWORD"
};

// End card. Spring scale-in lands in ~15f, then holds.
// MUST stay above y=1500. Centered vertically by default.
export const CTAEndCard: React.FC<Props> = ({ cta, brass, navy, subline = "Link in bio" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 90 }}>
      <div style={{ opacity: s, transform: `scale(${0.9 + s * 0.1})`, textAlign: "center", maxWidth: 900 }}>
        <div style={{
          color: "#fff", fontFamily: "Georgia, serif", fontWeight: 700,
          fontSize: 60, lineHeight: 1.12,
        }}>{cta}</div>
        <div style={{
          marginTop: 28, display: "inline-block", background: "#fff", color: navy,
          fontFamily: "Arial, sans-serif", fontWeight: 800, fontSize: 30,
          padding: "14px 28px", borderRadius: 999,
        }}>{subline}</div>
      </div>
    </AbsoluteFill>
  );
};
