#!/usr/bin/env node
// generate-pitch.mjs — pitch-content.json -> pitch.html  (sales demo, plain Node ESM)
//
// Usage: node tools/generate-pitch.mjs <pitch-content.json> [out.html]
// Default out: pitch.html next to the content file. Publish it to a static host with an
// UNGUESSABLE path so it's a private, per-prospect link (and host analytics = open-tracking).

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = resolve(__dirname, "../templates/pitch.template.html");
const TOKEN = "__PITCH_DATA__";

const dataPath = process.argv[2];
if (!dataPath) { console.error("Usage: node tools/generate-pitch.mjs <pitch-content.json> [out.html]"); process.exit(1); }
const dataAbs = resolve(process.cwd(), dataPath);
const outPath = process.argv[3] ? resolve(process.cwd(), process.argv[3]) : join(dirname(dataAbs), "pitch.html");

let data;
try { data = JSON.parse(readFileSync(dataAbs, "utf8")); }
catch (e) { console.error("Could not read/parse " + dataAbs + ":\n  " + e.message); process.exit(1); }
if (!data || !data.pitch || !Array.isArray(data.samples)) {
  console.error("pitch-content.json needs { pitch, calendar, samples }."); process.exit(1);
}

const template = readFileSync(TEMPLATE, "utf8");
if (!template.includes(TOKEN)) { console.error("Template missing " + TOKEN + " marker."); process.exit(1); }
const injected = JSON.stringify(data).replace(/<\/script>/gi, "<\\/script>");
writeFileSync(outPath, template.replace(TOKEN, injected), "utf8");

console.log("✓ wrote " + outPath);
console.log("  pitch for " + (data.pitch.prospect || "prospect") + " (" + (data.pitch.city || "") + ")");
console.log("  publish to a static host with an unguessable path -> private per-prospect link.");
