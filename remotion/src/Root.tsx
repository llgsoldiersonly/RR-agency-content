import { Composition } from "remotion";
import { Reel, ReelProps, reelDurationInFrames, FPS } from "./Reel";

// Demo props exercise the upgraded fields: hookVisual, emphasis per beat,
// motion intent per beat, position variation, and the 3-dial tier matrix.
const demoProps: ReelProps = {
  hook: "Most people quietly hurt their own claim on the first call.",
  hookVisual: "punch-in",
  area: "personal-injury",
  pillar: "MYTH",
  platform: "tiktok",
  beats: [
    { onscreen: "Step 1: See a doctor today", emphasis: ["today"],     motion: "punch-in", position: "bot" },
    { onscreen: "Step 2: Photograph everything", emphasis: ["everything"], motion: "punch-in", position: "bot" },
    { onscreen: "Step 3: Don't give a statement", emphasis: ["Don't"],  motion: "pop",      position: "mid" },
  ],
  cta: "Free review",
  ctaSubline: "Comment REVIEW",
  brand: { navy: "#0B2A4A", brass: "#C8A24B" },
  attorney: { name: "Dana Hartman", role: "Founding Attorney" },
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel}
    fps={FPS}
    width={1080}
    height={1920}
    durationInFrames={reelDurationInFrames(demoProps.beats.length)}
    defaultProps={demoProps}
    calculateMetadata={({ props }) => ({
      durationInFrames: reelDurationInFrames((props.beats || []).length || 3),
    })}
  />
);
