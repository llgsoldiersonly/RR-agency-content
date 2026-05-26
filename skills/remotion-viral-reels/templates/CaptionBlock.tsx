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

// Caption slot — explicit absolute position so the brass box geometry is
// guaranteed, not derived from flex+padding+maxWidth (which lets inline
// spans escape constraints under some browser/Remotion combinations).
// Slot lives at x:160-860 — entirely inside CAPTION PREFERRED (x:120-900)
// with 40px breathing room from RIGHT RAIL (starts at x=900) and from the
// left safe edge. Vertical anchor matches the corresponding edge of
// CAPTION PREFERRED (y:720-1280).
const slotStyle = (pos: CaptionPosition): React.CSSProperties => {
  const base: React.CSSProperties = {
    position: "absolute", left: 160, right: 220, textAlign: "center",
  };
  switch (pos) {
    case "top":
      return { ...base, top: 740 };
    case "mid":
      return { ...base, top: "50%", transform: "translateY(-50%)" };
    case "bot":
    default:
      return { ...base, bottom: 700 };
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
    <div style={slotStyle(position)}>
      <span
        style={{
          opacity,
          display: "inline-block",
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
          maxWidth: "100%",
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
