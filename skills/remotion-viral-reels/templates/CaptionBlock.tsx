import { interpolate, useCurrentFrame } from "remotion";
import { EmphasisWord, EmphasisTreatment } from "./EmphasisWord";
import type { CaptionPosition, MotionTier } from "./types";

type Props = {
  text: string;
  emphasis?: string[];                // words/phrases inside `text` to emphasize
  position?: CaptionPosition;         // "top" | "mid" | "bot" (default: bot)
  brass: string;
  navy: string;
  tier?: MotionTier;
  emphasisTreatment?: EmphasisTreatment;
};

// Vertical placement → padding mapping (in px from edge).
// Pads to land inside CAPTION PREFERRED zone (x:120-900, y:720-1280) and
// clear RIGHT RAIL (x≥900) + BOTTOM DANGER (y≥1500) + TOP DANGER (y<320).
// Padding is asymmetric (left 120, right 180) so the caption centers on
// CAPTION PREFERRED's center (x=510), not the frame center (x=540).
const positionStyle = (pos: CaptionPosition): React.CSSProperties => {
  switch (pos) {
    case "top":
      return { justifyContent: "flex-start", alignItems: "center", paddingTop: 720, paddingLeft: 120, paddingRight: 180 };
    case "mid":
      return { justifyContent: "center", alignItems: "center", paddingLeft: 120, paddingRight: 180 };
    case "bot":
    default:
      return { justifyContent: "flex-end", alignItems: "center", paddingBottom: 700, paddingLeft: 120, paddingRight: 180 };
  }
};

// Splits text into tokens, emphasising any token (case-insensitive) that appears in `emphasis`.
const tokenize = (text: string, emphasis: string[]) => {
  if (!emphasis.length) return [{ word: text, emphasised: false }];
  const lower = emphasis.map((e) => e.toLowerCase());
  // split on whitespace, preserving punctuation with the word
  return text.split(/(\s+)/).map((tok) => ({
    word: tok,
    emphasised: lower.includes(tok.toLowerCase().replace(/[.,!?;:]/g, "")),
  }));
};

export const CaptionBlock: React.FC<Props> = ({
  text, emphasis = [], position = "bot", brass, navy,
  tier = "medium", emphasisTreatment = "color",
}) => {
  const f = useCurrentFrame();
  const opacity = interpolate(f, [0, 9], [0, 1], { extrapolateRight: "clamp" });
  const translateY = interpolate(f, [0, 9], [34, 0], { extrapolateRight: "clamp" });

  const tokens = tokenize(text, emphasis);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", ...positionStyle(position) }}>
      <span
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          background: brass,
          color: navy,
          fontFamily: "'Arial Black', Arial, sans-serif",
          fontWeight: 800,
          fontSize: 70,
          lineHeight: 1.2,
          padding: "14px 26px",
          borderRadius: 16,
          textAlign: "center",
          maxWidth: 640,
          WebkitBoxDecorationBreak: "clone",
          boxDecorationBreak: "clone",
        }}
      >
        {tokens.map((t, i) =>
          t.emphasised ? (
            <EmphasisWord
              key={i}
              word={t.word}
              accent="#ffffff"
              treatment={emphasisTreatment}
              tier={tier}
              startFrame={0}
            />
          ) : (
            <span key={i}>{t.word}</span>
          )
        )}
      </span>
    </div>
  );
};
