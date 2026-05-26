// render-reels.mjs — render every reel in a content.json to MP4 via Remotion.
// Run from the remotion/ folder:  node render-reels.mjs ../clients/<slug>/content/<month>/content.json
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const dataPath = process.argv[2];
if (!dataPath) { console.error("Usage: node render-reels.mjs <content.json>"); process.exit(1); }
const dataAbs = resolve(process.cwd(), dataPath);
const contentDir = dirname(dataAbs);
const data = JSON.parse(readFileSync(dataAbs, "utf8"));
const brand = (data.project && data.project.brand) || { navy: "#0B2A4A", brass: "#C8A24B" };

// reels = items of type reel, plus lead-magnets that carry a script (they're reels too)
const reels = (data.items || []).filter((i) => i.type === "reel" || (i.type === "lead-magnet" && Array.isArray(i.script)));
if (!reels.length) { console.log("No reels found in", dataPath); process.exit(0); }

const outDir = join(contentDir, "reels");
mkdirSync(outDir, { recursive: true });

console.log("Bundling Remotion project…");
const serveUrl = await bundle({ entryPoint: resolve(process.cwd(), "src/index.ts") });

let n = 0;
for (const r of reels) {
  const inputProps = {
    hook: r.hook,
    beats: (r.script || []).map((s) => ({ onscreen: s.onscreen, line: s.line })),
    cta: r.cta || "Free review",
    brand,
    footage: r.footage,   // optional: place the clip in remotion/public and set item.footage
    music: r.music,       // optional: place a licensed track in remotion/public
  };
  const composition = await selectComposition({ serveUrl, id: "Reel", inputProps });
  const out = join(outDir, r.id + ".mp4");
  console.log(`Rendering ${r.id} (${inputProps.beats.length} beats)…`);
  await renderMedia({ composition, serveUrl, codec: "h264", outputLocation: out, inputProps });
  n++;
}
console.log(`✓ rendered ${n} reels (1080×1920 H.264) → ${outDir}`);
