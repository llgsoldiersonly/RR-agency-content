#!/usr/bin/env node
// carousel-studio.mjs — local studio with two pages:
//
//   /         → client-facing review dashboard (notes per slide,
//                approve/request changes, "Copy All Feedback")
//   /editor   → agency-side editor (inline edit + JSON tab + save)
//
// AI rerender, save, and load endpoints stay shared.

import http from "node:http";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { exportCarousel } from "./export-png.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PORT = Number(process.env.PORT) || 3001;
const OUT_DIR = resolve(ROOT, "mockups", "ai-generated");
const REVIEW_HTML = resolve(ROOT, "templates", "carousel-review.html");
const EDITOR_HTML = resolve(ROOT, "templates", "carousel-editor.html");
const RENDER_HTML = resolve(ROOT, "templates", "carousel-render.html");
const PROMPTS_PATH = resolve(ROOT, "mockups", "carousel-prompts.json");
const DATA_DIR = resolve(ROOT, "mockups", "data");

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(DATA_DIR, { recursive: true });

const OPENAI_KEY = process.env.OPENAI_API_KEY;

// ── OpenAI image generation ───────────────────────────────────────────
const callOpenAI = async (prompt, quality = "medium") => {
  if (!OPENAI_KEY) throw new Error("OPENAI_API_KEY env var is not set");
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: "gpt-image-1", prompt, size: "1024x1536", quality, n: 1 }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const data = await res.json();
  if (!data?.data?.[0]?.b64_json) throw new Error("OpenAI response missing b64_json");
  return data.data[0].b64_json;
};

// ── helpers ───────────────────────────────────────────────────────────
const sendJSON = (res, code, obj) => {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
};
const sendText = (res, code, text, type = "text/plain") => {
  res.writeHead(code, { "Content-Type": type });
  res.end(text);
};
const readBody = (req) =>
  new Promise((resolve) => {
    let b = "";
    req.on("data", (c) => (b += c));
    req.on("end", () => resolve(b));
  });

const carouselPath = (id) => {
  if (!/^[a-z0-9-]+$/i.test(id)) throw new Error("invalid carousel id");
  return join(DATA_DIR, `${id}.json`);
};

// Bundle all carousel JSON files in data/ into a single "project" payload
// for the review dashboard. Client name + generated date pulled from the
// first file's fields (a real implementation would derive these from the
// client config, but this is enough to ship the dashboard).
const loadProject = () => {
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  const carousels = files
    .map((f) => {
      const full = join(DATA_DIR, f);
      const doc = JSON.parse(readFileSync(full, "utf8"));
      return doc;
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  const first = carousels[0] || {};
  return {
    client_slug: first.client_slug || "unknown",
    client_name:
      first.client_slug === "hartman-injury-law" ? "Hartman Injury Law" :
      first.client_slug || "Unknown client",
    generated_at: new Date().toISOString().slice(0, 10),
    carousels: carousels.map((c) => ({
      ...c,
      section: c.section || "Carousels",
    })),
  };
};

// ── HTTP server ───────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // GET / — client review dashboard
  if (url.pathname === "/" && req.method === "GET") {
    return sendText(res, 200, readFileSync(REVIEW_HTML, "utf8"), "text/html; charset=utf-8");
  }

  // GET /editor — agency-side editor
  if (url.pathname === "/editor" && req.method === "GET") {
    return sendText(res, 200, readFileSync(EDITOR_HTML, "utf8"), "text/html; charset=utf-8");
  }

  // GET /render — single-slide full-size renderer (used by Puppeteer)
  if (url.pathname === "/render" && req.method === "GET") {
    return sendText(res, 200, readFileSync(RENDER_HTML, "utf8"), "text/html; charset=utf-8");
  }

  // POST /api/export/<id> — render every slide as a 1080×1440 PNG
  if (url.pathname.startsWith("/api/export/") && req.method === "POST") {
    const id = url.pathname.replace("/api/export/", "");
    try {
      if (!/^[a-z0-9-]+$/i.test(id)) throw new Error("invalid carousel id");
      console.log(`→ exporting ${id}…`);
      const t0 = Date.now();
      const result = await exportCarousel(id, {
        baseUrl: `http://localhost:${PORT}`,
        onProgress: ({ slide, total, status }) => {
          if (status === "done") console.log(`  ✓ slide ${slide}/${total}`);
        },
      });
      console.log(`✓ ${result.files.length} PNGs in ${((Date.now() - t0) / 1000).toFixed(1)}s → ${result.dir}`);
      return sendJSON(res, 200, result);
    } catch (e) {
      console.error(`✗ export ${id} failed:`, e.message);
      return sendText(res, 500, e.message);
    }
  }

  // GET /api/project — bundle all carousels for the review dashboard
  if (url.pathname === "/api/project" && req.method === "GET") {
    try { return sendJSON(res, 200, loadProject()); }
    catch (e) { return sendText(res, 500, e.message); }
  }

  // GET /api/carousel/<id> — single carousel doc (for the editor)
  if (url.pathname.startsWith("/api/carousel/") && req.method === "GET") {
    const id = url.pathname.replace("/api/carousel/", "");
    try {
      const file = carouselPath(id);
      if (!existsSync(file)) return sendText(res, 404, `no carousel "${id}"`);
      return sendText(res, 200, readFileSync(file, "utf8"), "application/json");
    } catch (e) { return sendText(res, 400, e.message); }
  }

  // POST /api/carousel/<id> — save (used by the editor)
  if (url.pathname.startsWith("/api/carousel/") && req.method === "POST") {
    const id = url.pathname.replace("/api/carousel/", "");
    try {
      const file = carouselPath(id);
      const body = await readBody(req);
      const parsed = JSON.parse(body);
      writeFileSync(file, JSON.stringify(parsed, null, 2) + "\n");
      console.log(`✓ saved ${id}.json (${body.length} bytes)`);
      return sendJSON(res, 200, { ok: true });
    } catch (e) {
      console.error(`✗ save ${id} failed:`, e.message);
      return sendText(res, 400, e.message);
    }
  }

  // GET /ai/<file>.png — serve generated PNG
  if (url.pathname.startsWith("/ai/") && req.method === "GET") {
    const filePath = resolve(OUT_DIR, url.pathname.replace("/ai/", ""));
    if (!filePath.startsWith(OUT_DIR) || !existsSync(filePath)) return sendText(res, 404, "not found");
    res.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "no-store" });
    return res.end(readFileSync(filePath));
  }

  // POST /regenerate — gpt-image-1
  if (url.pathname === "/regenerate" && req.method === "POST") {
    try {
      const { slide, quality } = JSON.parse((await readBody(req)) || "{}");
      if (!slide || slide < 1 || slide > 10) return sendText(res, 400, "slide must be 1-10");
      const prompts = JSON.parse(readFileSync(PROMPTS_PATH, "utf8"));
      const prompt = prompts[String(slide)];
      if (!prompt) return sendText(res, 404, `no prompt for slide ${slide}`);
      console.log(`→ regenerating slide ${slide} (gpt-image-1, quality=${quality || "medium"})…`);
      const t0 = Date.now();
      const b64 = await callOpenAI(prompt, quality);
      const ms = Date.now() - t0;
      const filename = `slide-${slide}.png`;
      writeFileSync(join(OUT_DIR, filename), Buffer.from(b64, "base64"));
      console.log(`  ✓ slide ${slide} saved (${(ms / 1000).toFixed(1)}s) → mockups/ai-generated/${filename}`);
      return sendJSON(res, 200, { ok: true, url: `/ai/${filename}` });
    } catch (e) {
      console.error("✗ regenerate failed:", e.message);
      return sendText(res, 500, e.message);
    }
  }

  return sendText(res, 404, "not found");
});

server.listen(PORT, () => {
  console.log("");
  console.log("┌─────────────────────────────────────────────────────────────────┐");
  console.log(`│  Carousel Studio   ▸ http://localhost:${PORT}                       │`);
  console.log("├─────────────────────────────────────────────────────────────────┤");
  console.log(`│  /         → client review dashboard (notes + copy feedback)    │`);
  console.log(`│  /editor   → agency editor (inline edit + Export PNGs)          │`);
  console.log(`│  /render   → single-slide renderer (used by export)             │`);
  console.log("│  ▸ ctrl-C to stop                                               │");
  console.log("└─────────────────────────────────────────────────────────────────┘");
  if (!OPENAI_KEY) console.log("  ⚠  set OPENAI_API_KEY before clicking AI rerender");
  console.log("");
});
