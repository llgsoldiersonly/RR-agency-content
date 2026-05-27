#!/usr/bin/env node
// carousel-studio.mjs — local studio: edit slides inline, edit JSON in side
// panel, save back to disk, optionally rerender any slide with gpt-image-1.
//
// Usage:
//   export OPENAI_API_KEY=sk-...   # only needed for AI rerender
//   node tools/carousel-studio.mjs
//
// Then open http://localhost:3001

import http from "node:http";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PORT = Number(process.env.PORT) || 3001;
const OUT_DIR = resolve(ROOT, "mockups", "ai-generated");
const EDITOR_HTML = resolve(ROOT, "templates", "carousel-editor.html");
const PROMPTS_PATH = resolve(ROOT, "mockups", "carousel-prompts.json");
const DATA_DIR = resolve(ROOT, "mockups", "data");

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(DATA_DIR, { recursive: true });

const OPENAI_KEY = process.env.OPENAI_API_KEY;

// ── OpenAI image generation ────────────────────────────────────────────
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

// ── HTTP server ───────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // GET / — editor HTML
  if (url.pathname === "/" && req.method === "GET") {
    return sendText(res, 200, readFileSync(EDITOR_HTML, "utf8"), "text/html; charset=utf-8");
  }

  // GET /api/carousel/<id> — return the JSON document
  if (url.pathname.startsWith("/api/carousel/") && req.method === "GET") {
    const id = url.pathname.replace("/api/carousel/", "");
    try {
      const file = carouselPath(id);
      if (!existsSync(file)) return sendText(res, 404, `no carousel "${id}"`);
      return sendText(res, 200, readFileSync(file, "utf8"), "application/json");
    } catch (e) { return sendText(res, 400, e.message); }
  }

  // POST /api/carousel/<id> — save the JSON document
  if (url.pathname.startsWith("/api/carousel/") && req.method === "POST") {
    const id = url.pathname.replace("/api/carousel/", "");
    try {
      const file = carouselPath(id);
      const body = await readBody(req);
      const parsed = JSON.parse(body);                  // throws on bad JSON
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

  // POST /regenerate — gpt-image-1 call → save PNG → return URL
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
  console.log("│  ▸ click any text on a slide to edit it inline                  │");
  console.log("│  ▸ edit the JSON tab on the right for bulk changes              │");
  console.log("│  ▸ ⌘S / Ctrl+S to save                                          │");
  console.log("│  ▸ click 'AI ↻' on a slide to rerender via gpt-image-1          │");
  console.log("│  ▸ ctrl-C to stop the server                                    │");
  console.log("└─────────────────────────────────────────────────────────────────┘");
  if (!OPENAI_KEY) console.log("  ⚠  set OPENAI_API_KEY before clicking AI rerender");
  console.log("");
});
