#!/usr/bin/env node
// render-slides.mjs — content.json -> finished carousel slide PNGs (1080x1350, no browser)
//
// Usage: node tools/render-slides.mjs <content.json>
// Writes: <content-dir>/carousels/<itemId>/01.png, 02.png, ...
// Needs: npm install   (root package.json pulls @napi-rs/canvas)

import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve, basename } from "node:path";

const W = 1080, H = 1350, M = 96;
const dataPath = process.argv[2];
if (!dataPath) { console.error("Usage: node tools/render-slides.mjs <content.json>"); process.exit(1); }
const dataAbs = resolve(process.cwd(), dataPath);
const contentDir = dirname(dataAbs);
const data = JSON.parse(readFileSync(dataAbs, "utf8"));

// brand
const B = (data.project && data.project.brand) || {};
const NAVY = B.navy || "#0B2A4A", NAVY2 = "#071a2e", BRASS = B.brass || "#C8A24B", INK = "#ffffff", SUB = "#d7dde6";
const HANDLE = (data.project && data.project.handle) || ("@" + ((data.project && data.project.clientSlug) || "yourfirm").replace(/-/g, ""));
const TAG = (data.project && data.project.tagline) || "";

// fonts: register brand TTFs from ../../assets/fonts if present; else rely on system fallbacks
const fontsDir = resolve(contentDir, "../../assets/fonts");
let DISPLAY = '"Caladea","DejaVu Serif",serif';   // container-safe editorial serif fallback
let BODY = '"Carlito","DejaVu Sans",sans-serif';
try {
  if (existsSync(fontsDir)) {
    for (const f of readdirSync(fontsDir)) {
      if (/\.(ttf|otf)$/i.test(f)) {
        const fam = basename(f).replace(/\.(ttf|otf)$/i, "");
        GlobalFonts.registerFromPath(join(fontsDir, f), fam);
        if (/fraunces|display|serif|heading/i.test(f)) DISPLAY = `"${fam}",` + DISPLAY;
        if (/newsreader|body|text|sans/i.test(f)) BODY = `"${fam}",` + BODY;
      }
    }
  }
} catch (e) { /* fall back to system fonts */ }

function wrap(ctx, text, maxW) {
  const words = String(text).split(/\s+/); const lines = []; let line = "";
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}
function drawLines(ctx, lines, x, y, lh) { lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh)); return y + lines.length * lh; }

function renderSlide(item, slide, idx, total) {
  const canvas = createCanvas(W, H); const ctx = canvas.getContext("2d");
  // bg gradient
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, NAVY); g.addColorStop(1, NAVY2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // soft top glow
  const rg = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, W); rg.addColorStop(0, "rgba(255,255,255,0.06)"); rg.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, 520);
  // header row
  ctx.fillStyle = BRASS; ctx.font = `600 24px ${BODY}`; ctx.textBaseline = "alphabetic";
  ctx.fillText(HANDLE, M, 120);
  ctx.textAlign = "right"; ctx.fillStyle = SUB; ctx.font = `400 24px ${BODY}`;
  ctx.fillText((idx + 1) + " / " + total, W - M, 120); ctx.textAlign = "left";
  // brass accent rule
  ctx.fillStyle = BRASS; ctx.fillRect(M, 150, 84, 6);

  const isCover = idx === 0, isLast = idx === total - 1;
  if (isCover) {
    ctx.fillStyle = INK; ctx.font = `900 84px ${DISPLAY}`;
    const lines = wrap(ctx, slide.heading, W - M * 2);
    const blockH = lines.length * 96; let y = (H - blockH) / 2;
    drawLines(ctx, lines, M, y, 96);
    if (slide.body) { ctx.fillStyle = SUB; ctx.font = `400 36px ${BODY}`; drawLines(ctx, wrap(ctx, slide.body, W - M * 2), M, y + blockH + 30, 48); }
    ctx.fillStyle = BRASS; ctx.font = `700 30px ${BODY}`; ctx.fillText("SWIPE →", M, H - 150);
  } else {
    // number chip
    ctx.fillStyle = BRASS; ctx.font = `900 120px ${DISPLAY}`; ctx.globalAlpha = 0.22;
    ctx.fillText(("0" + (idx)).slice(-2), M, 360); ctx.globalAlpha = 1;
    ctx.fillStyle = INK; ctx.font = `600 60px ${DISPLAY}`;
    const hLines = wrap(ctx, slide.heading, W - M * 2);
    let y = drawLines(ctx, hLines, M, 470, 70);
    ctx.fillStyle = SUB; ctx.font = `400 36px ${BODY}`;
    drawLines(ctx, wrap(ctx, slide.body || "", W - M * 2), M, y + 40, 50);
    if (isLast) { ctx.fillStyle = BRASS; ctx.fillRect(M, H - 230, 60, 5); }
  }
  // footer tagline
  if (TAG) { ctx.fillStyle = BRASS; ctx.font = `600 28px ${BODY}`; ctx.fillText(TAG, M, H - 90); }
  return canvas.toBuffer("image/png");
}

let count = 0, files = [];
for (const item of data.items || []) {
  if (item.type !== "carousel" || !Array.isArray(item.slides)) continue;
  const outDir = join(contentDir, "carousels", item.id);
  mkdirSync(outDir, { recursive: true });
  item.slides.forEach((slide, i) => {
    const buf = renderSlide(item, slide, i, item.slides.length);
    const fp = join(outDir, ("0" + (i + 1)).slice(-2) + ".png");
    writeFileSync(fp, buf); files.push(fp); count++;
  });
  console.log("  " + item.id + " → " + item.slides.length + " slides");
}
console.log("✓ rendered " + count + " slide PNGs (1080×1350) for " + ((data.project && data.project.client) || "client"));
if (files[0]) console.log("  e.g. " + files[0]);
