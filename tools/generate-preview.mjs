#!/usr/bin/env node
// generate-preview.mjs — content.json -> preview.html  (plain Node ESM, no dependencies)
//
// Usage:
//   node tools/generate-preview.mjs <content.json> [out.html]
//   node tools/generate-preview.mjs clients/hartman-injury-law/content/2026-06/content.json
//
// If out.html is omitted, writes preview.html next to the content.json.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = resolve(__dirname, "../templates/preview.template.html");
const TOKEN = "__INJECTED_DATA__";

const dataPath = process.argv[2];
if (!dataPath) {
  console.error("Usage: node tools/generate-preview.mjs <content.json> [out.html]");
  process.exit(1);
}
const dataAbs = resolve(process.cwd(), dataPath);
const outPath = process.argv[3]
  ? resolve(process.cwd(), process.argv[3])
  : join(dirname(dataAbs), "preview.html");

let data;
try {
  data = JSON.parse(readFileSync(dataAbs, "utf8"));
} catch (e) {
  console.error("Could not read/parse " + dataAbs + ":\n  " + e.message);
  process.exit(1);
}
if (!data || !Array.isArray(data.items)) {
  console.error("content.json must have an { project, items: [...] } shape.");
  process.exit(1);
}

const template = readFileSync(TEMPLATE, "utf8");
if (!template.includes(TOKEN)) {
  console.error("Template is missing the " + TOKEN + " marker.");
  process.exit(1);
}

// JSON.stringify is safe to drop into a <script> as long as we neutralize "</script>"
const injected = JSON.stringify(data).replace(/<\/script>/gi, "<\\/script>");
const html = template.replace(TOKEN, injected);
writeFileSync(outPath, html, "utf8");

console.log("✓ wrote " + outPath);
console.log("  " + data.items.length + " items for " + (data.project?.client || "client") +
            " (" + (data.project?.month || "") + ")");
console.log("  open it locally, or publish the file to a static host for a shareable review link.");
