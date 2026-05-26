import { Config } from "@remotion/cli/config";

// Don't dereference symlinks during module resolution. Keeps webpack
// module paths inside the project root (remotion/), so Remotion Studio's
// file server won't reject reads for sources reachable via
// remotion/src/skill/ (which symlinks to ../../skills/remotion-viral-reels/templates/).
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...(config.resolve ?? {}),
    symlinks: false,
  },
}));
