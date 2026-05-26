import {
  AbsoluteFill, Sequence, Audio, OffthreadVideo, interpolate, spring,
  useCurrentFrame, useVideoConfig, staticFile,
} from "remotion";

export type Beat = { onscreen: string; line?: string };
export type ReelProps = {
  hook: string;
  beats: Beat[];
  cta: string;
  brand: { navy: string; brass: string };
  footage?: string; // optional bg video placed in remotion/public
  music?: string;   // optional audio placed in remotion/public
};

export const FPS = 30;
export const HOOK_S = 2.6;
export const BEAT_S = 2.1;
export const CTA_S = 2.8;
export const reelDurationInFrames = (beatCount: number) =>
  Math.round((HOOK_S + beatCount * BEAT_S + CTA_S) * FPS);

const fadeUp = (frame: number) => ({
  opacity: interpolate(frame, [0, 9], [0, 1], { extrapolateRight: "clamp" as const }),
  transform: `translateY(${interpolate(frame, [0, 9], [34, 0], { extrapolateRight: "clamp" as const })}px)`,
});

const Hook: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 90 }}>
      <h1 style={{ ...fadeUp(f), color: "#fff", fontFamily: "Georgia, 'Times New Roman', serif",
        fontWeight: 900, fontSize: 92, lineHeight: 1.04, textAlign: "center", margin: 0 }}>
        {text}
      </h1>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ text: string; brass: string }> = ({ text, brass }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 360, paddingLeft: 70, paddingRight: 70 }}>
      <span style={{ ...fadeUp(f), background: brass, color: "#0b1f33",
        fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 800, fontSize: 70, lineHeight: 1.2,
        padding: "14px 26px", borderRadius: 16, textAlign: "center",
        WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone" }}>
        {text}
      </span>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ cta: string; brass: string }> = ({ cta, brass }) => {
  const f = useCurrentFrame();
  const s = spring({ frame: f, fps: FPS, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 90 }}>
      <div style={{ opacity: s, transform: `scale(${0.9 + s * 0.1})`, textAlign: "center" }}>
        <div style={{ color: "#fff", fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 60, lineHeight: 1.12 }}>{cta}</div>
        <div style={{ marginTop: 28, display: "inline-block", background: "#fff", color: "#0b1f33",
          fontFamily: "Arial, sans-serif", fontWeight: 800, fontSize: 30, padding: "14px 28px", borderRadius: 999 }}>
          Link in bio
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelProps> = ({ hook, beats, cta, brand, footage, music }) => {
  const { durationInFrames } = useVideoConfig();
  const hookF = Math.round(HOOK_S * FPS);
  const beatF = Math.round(BEAT_S * FPS);
  const ctaF = Math.round(CTA_S * FPS);
  return (
    <AbsoluteFill style={{ backgroundColor: brand.navy }}>
      {footage ? (
        <AbsoluteFill>
          <OffthreadVideo src={footage.startsWith("http") ? footage : staticFile(footage)} muted />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,42,74,.25), rgba(11,42,74,.78))" }} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,.08), transparent 60%)" }} />
      )}

      <Sequence durationInFrames={hookF}><Hook text={hook} /></Sequence>
      {beats.map((b, i) => (
        <Sequence key={i} from={hookF + i * beatF} durationInFrames={beatF}>
          <Caption text={b.onscreen || b.line || ""} brass={brand.brass} />
        </Sequence>
      ))}
      <Sequence from={durationInFrames - ctaF} durationInFrames={ctaF}>
        <EndCard cta={cta} brass={brand.brass} />
      </Sequence>

      {music ? <Audio src={music.startsWith("http") ? music : staticFile(music)} volume={0.4} /> : null}
    </AbsoluteFill>
  );
};
