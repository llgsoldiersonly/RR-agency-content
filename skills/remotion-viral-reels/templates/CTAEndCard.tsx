import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { DISPLAY_FONT } from "./fonts";

type Props = {
  cta: string;
  brass: string;
  navy: string;
  subline?: string;                          // e.g. "Link in bio" or "Comment KEYWORD"
  attorney?: { name: string; role?: string }; // big credibility credit
};

// End card. Spring scale-in lands in ~15f, then holds. MUST stay above y=1500.
// When an attorney is provided, the layout becomes a proper close: big name
// + role on top, then a brass divider, then the CTA action. This is where
// branding lands — the viewer sees the firm's actual human, not a watermark.
export const CTAEndCard: React.FC<Props> = ({
  cta, brass, navy, subline = "Link in bio", attorney,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "90px 180px" }}>
      <div style={{
        opacity: s, transform: `scale(${0.9 + s * 0.1})`,
        textAlign: "center", maxWidth: 720,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
      }}>
        {attorney ? (
          <>
            <div style={{
              color: "#fff", fontFamily: `${DISPLAY_FONT}, Georgia, serif`,
              fontWeight: 900, fontSize: 88, lineHeight: 1.02,
              letterSpacing: "-0.02em",
              textShadow: "0 4px 24px rgba(0,0,0,0.4)",
            }}>{attorney.name}</div>
            {attorney.role ? (
              <div style={{
                color: brass, fontFamily: "Arial, sans-serif",
                fontWeight: 800, fontSize: 30, lineHeight: 1,
                letterSpacing: "0.22em", textTransform: "uppercase",
              }}>{attorney.role}</div>
            ) : null}
            <div style={{
              width: 120, height: 3, background: brass, borderRadius: 2,
              margin: "10px 0 4px",
            }} />
          </>
        ) : null}

        <div style={{
          color: "#fff", fontFamily: `${DISPLAY_FONT}, Georgia, serif`,
          fontWeight: 700, fontSize: attorney ? 52 : 60, lineHeight: 1.1,
          letterSpacing: "-0.01em",
        }}>{cta}</div>

        <div style={{
          display: "inline-block", background: "#fff", color: navy,
          fontFamily: "Arial, sans-serif", fontWeight: 800, fontSize: 30,
          padding: "14px 28px", borderRadius: 999,
          boxShadow: "0 12px 22px rgba(0,0,0,0.35)",
        }}>{subline}</div>
      </div>
    </AbsoluteFill>
  );
};
