#!/usr/bin/env node
// scrape-prospect.mjs — fetch a prospect's website → demos/<slug>-demo/prospect.yml + logo
//
// Usage: node tools/scrape-prospect.mjs <url> [<slug>]
//
// Pulls the easy wins (firm name, logo, theme color, phone, email, city, practice area)
// from the homepage so you can send a pitch demo without 20 minutes of manual data entry.
// Anything we can't determine is left as `<FILL IN>` for the human to complete.

import { writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, extname } from "node:path";
import { URL } from "node:url";
import { load } from "cheerio";

const url = process.argv[2];
let slugArg = process.argv[3];
if (!url) {
  console.error("Usage: node tools/scrape-prospect.mjs <url> [<slug>]");
  console.error("Example: node tools/scrape-prospect.mjs https://vegainjurylawyers.com vega-injury");
  process.exit(1);
}

// Browser-ish UA — many law-firm sites block default Node/curl UA.
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

const fetchText = async (u) => {
  const r = await fetch(u, { headers: { "user-agent": UA, "accept": "text/html,*/*" }, redirect: "follow" });
  if (!r.ok) throw new Error("HTTP " + r.status + " " + u);
  return await r.text();
};
const fetchBuf = async (u) => {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA }, redirect: "follow" });
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    return buf.length > 500 ? buf : null;       // ignore 1x1 trackers
  } catch { return null; }
};

let html;
try { html = await fetchText(url); }
catch (e) { console.error("Could not fetch " + url + ":\n  " + e.message); process.exit(1); }

const base = new URL(url);
const $ = load(html);
const abs = (href) => { try { return href ? new URL(href, base).toString() : null; } catch { return null; } };

// ── firm name ─────────────────────────────────────────────────────────
// Title tags often have " | Personal Injury Lawyers" etc. — strip common tails.
const cleanTitle = (s) => (s || "").replace(/\s*[\-|–—·•]\s*(home|personal injury|car accident|injury lawyers?|attorneys? at law|law firm|p\.?[acl]\.?|llc|llp).*$/i, "").trim();
const titleTag = cleanTitle($("title").text());
const ogSite   = $('meta[property="og:site_name"]').attr("content");
const ogTitle  = cleanTitle($('meta[property="og:title"]').attr("content"));
const h1       = $("h1").first().text().trim();
const firmName = ogSite || ogTitle || titleTag || h1 || base.hostname.replace(/^www\./, "");

// ── logo candidates (highest-quality first) ───────────────────────────
const logoCandidates = [
  $('link[rel="apple-touch-icon"]').attr("href"),
  $('link[rel="apple-touch-icon-precomposed"]').attr("href"),
  $('meta[property="og:image"]').attr("content"),
  $('img[alt*="logo" i]').first().attr("src"),
  $('img[class*="logo" i]').first().attr("src"),
  $('img[src*="logo" i]').first().attr("src"),
  $('link[rel="icon"][sizes*="192"]').attr("href"),
  $('link[rel="icon"]').attr("href"),
  "/logo.svg", "/logo.png", "/images/logo.svg", "/images/logo.png",
  "/assets/logo.png", "/wp-content/uploads/logo.png",
].map(abs).filter(Boolean);

let logoBuf = null, logoUrl = null;
for (const u of logoCandidates) {
  const buf = await fetchBuf(u);
  if (buf) { logoBuf = buf; logoUrl = u; break; }
}

// ── brand color (meta theme-color only — logo color extraction is V2) ─
const themeColor = ($('meta[name="theme-color"]').attr("content") || "").trim();

// ── phone / email ─────────────────────────────────────────────────────
const phone = ($('a[href^="tel:"]').first().attr("href") || "").replace(/^tel:/, "").trim();
const email = ($('a[href^="mailto:"]').first().attr("href") || "").replace(/^mailto:/, "").split("?")[0].trim();

// ── city / state (schema.org JSON-LD PostalAddress) ───────────────────
let city = "", state = "";
$('script[type="application/ld+json"]').each((_, el) => {
  try {
    const ld = JSON.parse($(el).contents().text());
    const walk = (node) => {
      if (!node || typeof node !== "object") return;
      if (node.address && (node.address.addressLocality || node.address.addressRegion)) {
        city  ||= node.address.addressLocality || "";
        state ||= node.address.addressRegion   || "";
      }
      for (const k of Object.keys(node)) walk(node[k]);
    };
    walk(ld);
  } catch {}
});

// ── practice area (pattern-match against our seven hooks) ─────────────
const areaPatterns = {
  "personal injury":  /personal injury|car accident|truck accident|wrongful death|slip[\s-]?and[\s-]?fall|motorcycle accident|injury law/i,
  "criminal":         /criminal defen[cs]e|dui|dwi|drug crime|assault charge/i,
  "family":           /family law|divorce|custody|child support|prenup/i,
  "lemon law":        /lemon law/i,
  "workers comp":     /workers'?\s?comp(ensation)?/i,
  "immigration":      /immigration|visa|asylum|green card|naturali[sz]ation/i,
  "probate":          /probate|estate planning|wills?\s+and\s+trusts?/i,
};
const corpus = ($("title").text() + " " + $("h1,h2,nav,a").text()).toLowerCase();
let practiceArea = "";
for (const [k, re] of Object.entries(areaPatterns)) {
  if (re.test(corpus)) { practiceArea = k; break; }
}

// ── slug + output dir ─────────────────────────────────────────────────
const derivedSlug = base.hostname.replace(/^www\./, "").split(".")[0].toLowerCase();
let slug = (slugArg || derivedSlug).replace(/[^a-z0-9-]/gi, "-").toLowerCase();
if (!slug.endsWith("-demo")) slug += "-demo";

const outDir = resolve(process.cwd(), "demos", slug);
const assetsDir = join(outDir, "assets");
mkdirSync(assetsDir, { recursive: true });

let logoPath = "";
if (logoBuf && logoUrl) {
  const ext = (extname(new URL(logoUrl).pathname).toLowerCase() || ".png").split("?")[0];
  const filename = "logo" + (ext.length <= 5 ? ext : ".png");
  writeFileSync(join(assetsDir, filename), logoBuf);
  logoPath = "assets/" + filename;
}

const yaml = [
  "# Prospect intake — auto-scraped from " + url + " on " + new Date().toISOString().slice(0,10),
  "# REVIEW EACH FIELD before sending. Scraping isn't perfect; markers below need a human.",
  "agency: <FILL IN — your agency name>",
  "agency_cta_label: Book your strategy call",
  "agency_cta_url: <FILL IN — your booking link>",
  "agency_email: <FILL IN — your email>",
  "prospect_firm: " + firmName,
  "prospect_attorney: <FILL IN — lead attorney name>",
  "city: " + (city || "<FILL IN>"),
  "practice_area: " + (practiceArea || "<FILL IN — personal injury | criminal | family | lemon law | workers comp | immigration | probate>"),
  "brand_color: " + (themeColor ? '"' + themeColor + '"' : '"#0B2A4A"  # not detected — open their site, eyedropper their primary'),
  "case_type_wanted: <FILL IN — e.g. car & truck accidents>",
  "local_notes: <FILL IN — highways, weather, hospitals, anything that ties to their city>",
  "",
  "# Scraped reference (informational — not consumed by generate-pitch.mjs):",
  "# source_url:  " + url,
  "# state:       " + (state || "(not found)"),
  "# phone:       " + (phone || "(not found)"),
  "# email:       " + (email || "(not found)"),
  "# logo_source: " + (logoUrl || "(not found)"),
  "# logo_saved:  " + (logoPath || "(none)"),
  "",
].join("\n");

writeFileSync(join(outDir, "prospect.yml"), yaml);

console.log("✓ scraped → demos/" + slug + "/");
console.log("  firm:         " + firmName);
console.log("  city/state:   " + (city ? (city + (state ? ", " + state : "")) : "(needs manual fill)"));
console.log("  practice:     " + (practiceArea || "(needs manual fill)"));
console.log("  brand color:  " + (themeColor || "(needs manual fill — eyedropper from their site)"));
console.log("  phone:        " + (phone || "(not found)"));
console.log("  logo:         " + (logoPath || "(not found — drop one into assets/ manually)"));
console.log("");
console.log("Next: review demos/" + slug + "/prospect.yml, fill the <FILL IN> markers, then");
console.log("ask Claude Code to generate pitch-content.json, then `node tools/generate-pitch.mjs ...`");
