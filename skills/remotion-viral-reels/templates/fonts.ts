// Centralized font loading for the reel renderer. Single import point so
// HookVisuals / CTAEndCard / AttorneyLowerThird all use the exact same
// font family string and the font is requested from Google once per bundle.
//
// We use Fraunces as the display face (variable-weight serif — feels
// editorial without being stuffy, reads well at 70-280px). Captions
// stay on Arial Black via system stack since the heavy sans-serif is
// what reads natively as a Reels/TikTok overlay caption.
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";

const fraunces = loadFraunces("normal", {
  weights: ["400", "600", "700", "900"],
});

export const DISPLAY_FONT = fraunces.fontFamily; // "Fraunces"
