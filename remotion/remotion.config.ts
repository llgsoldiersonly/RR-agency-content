import { Config } from "@remotion/cli/config";
import path from "node:path";

// Don't dereference symlinks during module resolution. Keeps webpack module
// paths inside the project root (remotion/) so Remotion Studio's file server
// won't reject reads for sources reachable via remotion/src/skill/ (which
// symlinks to ../../skills/remotion-viral-reels/templates/).
//
// Also add remotion/node_modules to the module search roots so templates
// living *outside* the remotion project (the skill folder) can still
// import npm deps like @remotion/google-fonts that we installed here.
//
// process.cwd() is the `remotion/` directory when `npm run studio` or
// `node render-reels.mjs` run (both invoked from this folder). Used
// instead of import.meta because Remotion compiles this config to CJS.
const REMOTION_DIR = process.cwd();

Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...(config.resolve ?? {}),
    symlinks: false,
    modules: [
      path.resolve(REMOTION_DIR, "node_modules"),
      "node_modules",
      ...((config.resolve && config.resolve.modules) || []),
    ],
  },
}));
