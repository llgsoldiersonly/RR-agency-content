import { interpolate, useCurrentFrame } from "remotion";
import { DISPLAY_FONT } from "./fonts";

type Props = {
  name: string;
  role?: string;             // e.g. "Founding Attorney" or "PI Lead"
  navy: string;
  brass: string;
  delayFrames?: number;      // when to fade in (default: right after hook)
};

// Top-left brand chip — sits between TOP DANGER (ends y=320) and CAPTION
// PREFERRED (starts y=720) so it never collides with hook or caption.
// Always visible after fade-in; works as a station ID for the reel.
export const AttorneyLowerThird: React.FC<Props> = ({
  name, role, navy, brass, delayFrames = 78,   // ≈ hook end @ 2.6s × 30fps
}) => {
  const f = useCurrentFrame();
  const opacity = interpolate(f, [delayFrames, delayFrames + 12], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const slideX = interpolate(f, [delayFrames, delayFrames + 12], [-30, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{
      position: "absolute", left: 120, top: 380, opacity,
      transform: `translateX(${slideX}px)`,
      display: "flex", alignItems: "center", gap: 14,
      background: `${navy}cc`, padding: "12px 22px 12px 16px",
      borderRadius: 999, border: `1px solid ${brass}55`,
      backdropFilter: "blur(8px)",
      filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.35))",
    }}>
      <span style={{
        width: 12, height: 12, borderRadius: "50%", background: brass,
        boxShadow: `0 0 12px ${brass}99`,
      }} />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
        <span style={{
          color: "#fff", fontFamily: `${DISPLAY_FONT}, Georgia, serif`,
          fontWeight: 700, fontSize: 30,
        }}>{name}</span>
        {role ? (
          <span style={{
            color: `${brass}ee`, fontFamily: "Arial, sans-serif",
            fontWeight: 600, fontSize: 16, letterSpacing: "0.08em",
            textTransform: "uppercase", marginTop: 2,
          }}>{role}</span>
        ) : null}
      </div>
    </div>
  );
};
