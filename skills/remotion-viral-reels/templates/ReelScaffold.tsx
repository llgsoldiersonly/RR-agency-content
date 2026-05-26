import {
  AbsoluteFill, Audio, OffthreadVideo, Sequence,
  staticFile, useVideoConfig,
} from "remotion";
import { AttorneyLowerThird } from "./AttorneyLowerThird";
import { CaptionBlock } from "./CaptionBlock";
import { CTAEndCard } from "./CTAEndCard";
import { HookVisual, HookVisualKind } from "./HookVisuals";
import { SafeZoneOverlay } from "./SafeZoneOverlay";
import { ZoomBeat } from "./ZoomBeat";
import type { MotionTier, ScriptBeat } from "./types";

export type ReelScaffoldProps = {
  hook: string;
  hookVisual?: HookVisualKind;
  beats: ScriptBeat[];
  cta: string;
  ctaSubline?: string;
  brand: { navy: string; brass: string };
  tier: MotionTier;             // computed via computeMotionTier(area, pillar, platform)
  footage?: string;
  music?: string;
  attorney?: { name: string; role?: string };  // optional brand chip
};

export const FPS = 30;
export const HOOK_S = 2.6;
export const BEAT_S = 2.1;
export const CTA_S  = 2.8;

export const reelDurationInFrames = (beatCount: number) =>
  Math.round((HOOK_S + beatCount * BEAT_S + CTA_S) * FPS);

const isDev = process.env.REMOTION_DEV_SAFEZONES === "1";

// SVG noise texture as a data URI. Used as a subtle grain layer over the
// no-footage background so the reel doesn't read as "flat color slide."
// 240×240 tile, fractal noise, baked into a single base64-encoded string.
const GRAIN_SVG = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">' +
  '<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3"/>' +
  '<feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0"/></filter>' +
  '<rect width="240" height="240" filter="url(#n)"/></svg>'
);
const GRAIN_URL = `url("data:image/svg+xml;utf8,${GRAIN_SVG}")`;

// Drop-in production scaffold. Use this from your project's RemotionRoot.
// Wires hook visual → beats (with motion + emphasis + position) → CTA end card,
// plus optional B-roll and music, plus the attorney chip, plus dev safe-zone overlay.
export const ReelScaffold: React.FC<ReelScaffoldProps> = ({
  hook, hookVisual = "punch-in", beats, cta, ctaSubline,
  brand, tier, footage, music, attorney,
}) => {
  const { durationInFrames } = useVideoConfig();
  const hookF = Math.round(HOOK_S * FPS);
  const beatF = Math.round(BEAT_S * FPS);
  const ctaF  = Math.round(CTA_S  * FPS);

  return (
    <AbsoluteFill style={{ backgroundColor: brand.navy }}>
      {footage ? (
        <AbsoluteFill>
          <OffthreadVideo src={footage.startsWith("http") ? footage : staticFile(footage)} muted />
          <AbsoluteFill style={{
            background: "linear-gradient(180deg, rgba(11,42,74,.25), rgba(11,42,74,.78))",
          }} />
        </AbsoluteFill>
      ) : (
        <>
          <AbsoluteFill style={{
            background: "radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,.08), transparent 60%)",
          }} />
          {/* Subtle grain — keeps the no-footage background from reading as a flat slide */}
          <AbsoluteFill style={{
            backgroundImage: GRAIN_URL,
            opacity: 0.14,
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }} />
          {/* Soft vignette for cinematic depth */}
          <AbsoluteFill style={{
            background: "radial-gradient(120% 100% at 50% 60%, transparent 55%, rgba(0,0,0,0.45) 100%)",
            pointerEvents: "none",
          }} />
        </>
      )}

      <Sequence durationInFrames={hookF}>
        <HookVisual kind={hookVisual} text={hook} brass={brand.brass} navy={brand.navy} tier={tier} />
      </Sequence>

      {beats.map((b, i) => (
        <Sequence key={i} from={hookF + i * beatF} durationInFrames={beatF}>
          <ZoomBeat motion={b.motion ?? "none"} tier={tier}>
            <CaptionBlock
              text={b.onscreen || b.line || ""}
              emphasis={b.emphasis ?? []}
              position={b.position ?? "bot"}
              brass={brand.brass}
              navy={brand.navy}
              tier={tier}
            />
          </ZoomBeat>
        </Sequence>
      ))}

      <Sequence from={durationInFrames - ctaF} durationInFrames={ctaF}>
        <CTAEndCard cta={cta} brass={brand.brass} navy={brand.navy} subline={ctaSubline} />
      </Sequence>

      {/* Attorney chip — sits between TOP DANGER and CAPTION PREFERRED. Fades in after the
          hook so it doesn't compete with the headline, then holds for the rest of the reel. */}
      {attorney ? (
        <AttorneyLowerThird
          name={attorney.name}
          role={attorney.role}
          navy={brand.navy}
          brass={brand.brass}
          delayFrames={hookF}
        />
      ) : null}

      {music ? <Audio src={music.startsWith("http") ? music : staticFile(music)} volume={0.4} /> : null}

      {isDev ? <SafeZoneOverlay /> : null}
    </AbsoluteFill>
  );
};
