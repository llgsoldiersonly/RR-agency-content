import { Composition } from "remotion";
import { Reel, ReelProps, reelDurationInFrames, FPS } from "./Reel";

const demoProps: ReelProps = {
  hook: "Crashes happen on I-275 and I-4 every day — the first 24 hours decide what your claim is worth.",
  beats: [
    { onscreen: "1. See a doctor TODAY" },
    { onscreen: "2. Photograph everything" },
    { onscreen: "3. Wait on a statement" },
  ],
  cta: "Free review",
  brand: { navy: "#0B2A4A", brass: "#C8A24B" },
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
