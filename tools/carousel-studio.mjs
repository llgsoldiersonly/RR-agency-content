#!/usr/bin/env node
// carousel-studio.mjs — local studio for the Hartman carousel mockup.
//
// Serves the HTML mockup at http://localhost:3001 with a "rerender with AI"
// overlay button on each slide. Click triggers a server-side call to OpenAI's
// gpt-image-1 model and shows the generated image alongside the HTML version.
//
// Usage:
//   export OPENAI_API_KEY=sk-...
//   node tools/carousel-studio.mjs
//
// Then open http://localhost:3001 in your browser.

import http from "node:http";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PORT = 3001;
const OUT_DIR = resolve(ROOT, "mockups", "ai-generated");
const MOCKUP_PATH = resolve(ROOT, "mockups", "hartman-settlement-carousel.html");
const PROMPTS_PATH = resolve(ROOT, "mockups", "carousel-prompts.json");

mkdirSync(OUT_DIR, { recursive: true });

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.warn("⚠  OPENAI_API_KEY not set — AI rerender will return an error.");
  console.warn("   To use AI rerender:  export OPENAI_API_KEY=sk-...  then restart.");
}

// ── OpenAI image generation ────────────────────────────────────────────
const callOpenAI = async (prompt, quality = "medium") => {
  if (!OPENAI_KEY) throw new Error("OPENAI_API_KEY env var is not set");
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1024x1536",                  // closest portrait — slightly taller than IG's 4:5
      quality,                            // "low" / "medium" / "high"
      n: 1,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 400)}`);
  }
  const data = await res.json();
  if (!data?.data?.[0]?.b64_json) throw new Error("OpenAI response missing b64_json");
  return data.data[0].b64_json;
};

// ── studio client script — injected into the mockup HTML at serve time ─
const STUDIO_CLIENT = `
<style>
  .studio-bar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
    background: #1a1f2e; color: #ddd; padding: 10px 20px;
    font-family: -apple-system, sans-serif; font-size: 13px;
    border-bottom: 1px solid #333;
    display: flex; align-items: center; gap: 16px;
  }
  .studio-bar button {
    background: #C8A24B; color: #0B2A4A; border: none;
    padding: 8px 16px; border-radius: 6px; cursor: pointer;
    font-weight: 800; font-size: 13px;
  }
  .studio-bar button:hover { background: #E4BC60; }
  .studio-bar button:disabled { opacity: 0.5; cursor: not-allowed; }
  .studio-bar .status { color: #aaa; }
  body.studio { padding-top: 56px !important; }
  .slide { position: relative; }
  .slide-overlay {
    position: absolute; top: 8px; right: 8px; z-index: 10;
    display: flex; gap: 6px;
  }
  .slide-overlay button {
    background: rgba(200,162,75,0.95); color: #0B2A4A; border: none;
    padding: 4px 10px; border-radius: 4px; cursor: pointer;
    font-family: -apple-system, sans-serif; font-weight: 700; font-size: 11px;
  }
  .slide-overlay button:hover { background: #E4BC60; }
  .slide-overlay button:disabled { opacity: 0.5; }
  .slide .ai-img {
    position: absolute; inset: 0; width: 100%; height: 100%;
    object-fit: cover; border-radius: 10px;
    display: none;
  }
  .slide.showing-ai .frame { display: none; }
  .slide.showing-ai .ai-img { display: block; }
  .slide .label-tag {
    position: absolute; bottom: 8px; left: 8px; z-index: 10;
    background: rgba(0,0,0,0.6); color: #fff;
    padding: 2px 8px; border-radius: 4px;
    font-family: -apple-system, sans-serif; font-size: 10px;
    letter-spacing: 0.05em; text-transform: uppercase;
  }
</style>
<script>
(function () {
  document.body.classList.add("studio");
  // top bar
  const bar = document.createElement("div");
  bar.className = "studio-bar";
  bar.innerHTML =
    '<strong>Carousel Studio</strong>' +
    '<button id="rerender-all">Rerender all 10 with AI</button>' +
    '<button id="toggle-all">Toggle all (AI / HTML)</button>' +
    '<span class="status" id="status">Idle</span>';
  document.body.insertBefore(bar, document.body.firstChild);

  // wrap each slide
  const slides = Array.from(document.querySelectorAll(".slide"));
  slides.forEach((slide, idx) => {
    const n = idx + 1;
    slide.dataset.slide = n;
    const overlay = document.createElement("div");
    overlay.className = "slide-overlay";
    overlay.innerHTML =
      '<button data-action="rerender">AI ↻</button>' +
      '<button data-action="toggle" disabled>Show AI</button>';
    slide.appendChild(overlay);
    const aiImg = document.createElement("img");
    aiImg.className = "ai-img";
    aiImg.alt = "AI-generated slide " + n;
    slide.appendChild(aiImg);
  });

  const status = (msg) => { document.getElementById("status").textContent = msg; };

  const rerenderOne = async (slide) => {
    const n = parseInt(slide.dataset.slide, 10);
    const overlay = slide.querySelector(".slide-overlay");
    const btnRe = overlay.querySelector('[data-action="rerender"]');
    const btnTog = overlay.querySelector('[data-action="toggle"]');
    btnRe.disabled = true; btnRe.textContent = "AI …";
    status("Generating slide " + n + " (gpt-image-1, ~15-30s)…");
    try {
      const res = await fetch("/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slide: n }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const img = slide.querySelector(".ai-img");
      img.src = data.url + "?t=" + Date.now();
      img.onload = () => {
        slide.classList.add("showing-ai");
        btnTog.disabled = false; btnTog.textContent = "Show HTML";
        btnRe.disabled = false; btnRe.textContent = "AI ↻";
        const tag = document.createElement("div");
        tag.className = "label-tag";
        tag.textContent = "AI · gpt-image-1";
        slide.appendChild(tag);
        status("Done. Slide " + n + " rerendered.");
      };
    } catch (e) {
      console.error(e);
      status("Slide " + n + " failed: " + e.message);
      btnRe.disabled = false; btnRe.textContent = "AI ↻";
    }
  };

  document.body.addEventListener("click", (e) => {
    const slide = e.target.closest(".slide");
    if (!slide) return;
    if (e.target.matches('[data-action="rerender"]')) {
      rerenderOne(slide);
    } else if (e.target.matches('[data-action="toggle"]')) {
      slide.classList.toggle("showing-ai");
      e.target.textContent = slide.classList.contains("showing-ai") ? "Show HTML" : "Show AI";
    }
  });

  document.getElementById("rerender-all").addEventListener("click", async () => {
    const btn = document.getElementById("rerender-all");
    btn.disabled = true; btn.textContent = "Generating 10 slides…";
    for (const slide of slides) {
      await rerenderOne(slide);
    }
    btn.disabled = false; btn.textContent = "Rerender all 10 with AI";
    status("Batch complete.");
  });

  document.getElementById("toggle-all").addEventListener("click", () => {
    const anyShowing = slides.some((s) => s.classList.contains("showing-ai"));
    slides.forEach((s) => {
      const tog = s.querySelector('[data-action="toggle"]');
      if (anyShowing) { s.classList.remove("showing-ai"); if (tog) tog.textContent = "Show AI"; }
      else if (s.querySelector(".ai-img").src) { s.classList.add("showing-ai"); if (tog) tog.textContent = "Show HTML"; }
    });
  });
})();
</script>
`;

// ── HTTP server ───────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // GET / — serve the mockup with studio script injected
  if (url.pathname === "/" && req.method === "GET") {
    const html = readFileSync(MOCKUP_PATH, "utf8");
    const wrapped = html.replace("</body>", STUDIO_CLIENT + "</body>");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(wrapped);
    return;
  }

  // GET /ai/<file>.png — serve generated PNG
  if (url.pathname.startsWith("/ai/") && req.method === "GET") {
    const filename = url.pathname.replace("/ai/", "");
    const filePath = resolve(OUT_DIR, filename);
    if (!filePath.startsWith(OUT_DIR) || !existsSync(filePath)) {
      res.writeHead(404); res.end("not found"); return;
    }
    res.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "no-store" });
    res.end(readFileSync(filePath));
    return;
  }

  // POST /regenerate — call OpenAI, save PNG, return URL
  if (url.pathname === "/regenerate" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        const { slide, quality } = JSON.parse(body || "{}");
        if (!slide || slide < 1 || slide > 10) {
          res.writeHead(400); res.end("slide must be 1-10"); return;
        }
        const prompts = JSON.parse(readFileSync(PROMPTS_PATH, "utf8"));
        const prompt = prompts[String(slide)];
        if (!prompt) { res.writeHead(404); res.end(`no prompt for slide ${slide}`); return; }
        console.log(`→ regenerating slide ${slide} (gpt-image-1, quality=${quality || "medium"})…`);
        const t0 = Date.now();
        const b64 = await callOpenAI(prompt, quality);
        const ms = Date.now() - t0;
        const filename = `slide-${slide}.png`;
        writeFileSync(join(OUT_DIR, filename), Buffer.from(b64, "base64"));
        console.log(`  ✓ slide ${slide} saved (${(ms / 1000).toFixed(1)}s) → mockups/ai-generated/${filename}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, url: `/ai/${filename}` }));
      } catch (e) {
        console.error("✗ regenerate failed:", e.message);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(e.message);
      }
    });
    return;
  }

  res.writeHead(404); res.end("not found");
});

server.listen(PORT, () => {
  console.log("");
  console.log("┌─────────────────────────────────────────────────────────────────┐");
  console.log("│  Carousel Studio                                                │");
  console.log("├─────────────────────────────────────────────────────────────────┤");
  console.log("│  ▸ open  http://localhost:" + PORT + "                                  │");
  console.log("│  ▸ click 'AI ↻' on any slide to rerender via gpt-image-1        │");
  console.log("│  ▸ cost ~$0.04-0.17/slide @ medium quality                      │");
  console.log("│  ▸ ctrl-C to stop                                               │");
  console.log("└─────────────────────────────────────────────────────────────────┘");
  if (!OPENAI_KEY) console.log("  ⚠  set OPENAI_API_KEY before clicking rerender");
  console.log("");
});
