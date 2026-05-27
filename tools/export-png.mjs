#!/usr/bin/env node
// export-png.mjs — render every slide in a carousel as a 1080×1440 PNG via
// headless Chrome (puppeteer). Used by the studio's POST /api/export and
// also runnable standalone:
//
//   node tools/export-png.mjs hartman-settlement
//
// Output: mockups/exports/<carousel-id>/slide-NN.png (1-based, padded).

import puppeteer from "puppeteer";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT, "mockups", "data");
const EXPORT_BASE = resolve(ROOT, "mockups", "exports");

export async function exportCarousel(carouselId, { baseUrl = "http://localhost:3001", onProgress } = {}) {
  const docPath = join(DATA_DIR, `${carouselId}.json`);
  const doc = JSON.parse(readFileSync(docPath, "utf8"));

  const outDir = join(EXPORT_BASE, carouselId);
  mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const files = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 2 });
    for (const slide of doc.slides) {
      const url = `${baseUrl}/render?id=${encodeURIComponent(carouselId)}&slide=${slide.n}`;
      onProgress?.({ slide: slide.n, total: doc.slides.length, status: "rendering" });
      await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
      await page.waitForFunction(() => document.body.dataset.ready === "1", { timeout: 10000 });
      // Tiny extra delay so any animation settles
      await new Promise((r) => setTimeout(r, 100));
      const filename = `slide-${String(slide.n).padStart(2, "0")}.png`;
      const fullPath = join(outDir, filename);
      await page.screenshot({ path: fullPath, type: "png", omitBackground: false, clip: { x: 0, y: 0, width: 1080, height: 1440 } });
      files.push(filename);
      onProgress?.({ slide: slide.n, total: doc.slides.length, status: "done" });
    }
  } finally {
    await browser.close();
  }
  return { dir: outDir, files };
}

// CLI entry
if (import.meta.url === `file://${process.argv[1]}`) {
  const carouselId = process.argv[2];
  if (!carouselId) { console.error("usage: node tools/export-png.mjs <carousel-id>"); process.exit(1); }
  const t0 = Date.now();
  console.log(`→ exporting ${carouselId} via headless Chrome…`);
  const { dir, files } = await exportCarousel(carouselId, {
    onProgress: ({ slide, total, status }) => {
      if (status === "done") console.log(`  ✓ slide ${slide}/${total}`);
    },
  });
  console.log(`✓ exported ${files.length} PNGs in ${((Date.now() - t0) / 1000).toFixed(1)}s → ${dir}`);
}
