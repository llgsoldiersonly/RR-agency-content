import { Config } from "@remotion/cli/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Don't dereference symlinks during module resolution. Keeps webpack module
// paths inside the project root (remotion/) so Remotion Studio's file server
// won't reject reads for sources reachable via remotion/src/skill/ (which
// symlinks to ../../skills/remotion-viral-reels/templates/).
//
// Also add remotion/node_modules to the module search roots so templates
// living *outside* the remotion project (the skill folder) can still
// import npm deps like @remotion/google-fonts that we installed here.
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...(config.resolve ?? {}),
    symlinks: false,
    modules: [
      path.resolve(__dirname, "node_modules"),
      "node_modules",
      ...((config.resolve && config.resolve.modules) || []),
    ],
  },
}));
