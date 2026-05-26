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

// ── logo candidates (visible page logos beat favicons — apple-touch-icon
//    is just a 180×180 square crop, not the horizontal logotype we want
//    showing in a pitch hero). We also explicitly reject URLs that look
//    like favicons (cropped-*Favicon* is WordPress's auto-generated
//    icon naming pattern) until we've exhausted every real-logo option.
const isFaviconUrl = (u) => /favicon|cropped-.*-(?:32|180|192|512)x\d+/i.test(u || "");

const logoCandidates = [
  // explicit "logo" attribution
  $('img[alt*="logo" i]').first().attr("src"),
  $('img.custom-logo').first().attr("src"),                // WordPress standard
  $('img[class*="logo" i]').first().attr("src"),
  $('img[id*="logo" i]').first().attr("src"),
  $('img[src*="logo" i]').first().attr("src"),
  // logo containers (img nested inside something tagged as logo/brand)
  $('[class*="logo" i] img').first().attr("src"),
  $('[id*="logo" i] img').first().attr("src"),
  $('[class*="brand" i] img').first().attr("src"),
  $('.site-title img, .site-branding img').first().attr("src"),
  // home-link image — overwhelmingly the firm's header mark
  $('a[href="/"] img').first().attr("src"),
  $('a[href$="' + base.hostname + '"] img').first().attr("src"),
  $('a[href$="' + base.hostname + '/"] img').first().attr("src"),
  // first img anywhere inside header/nav
  $('header img, nav img').first().attr("src"),
  // social card (often the firm's mark with their tagline)
  $('meta[property="og:image"]').attr("content"),
  // last resort: square favicons
  $('link[rel="apple-touch-icon"]').attr("href"),
  $('link[rel="apple-touch-icon-precomposed"]').attr("href"),
  $('link[rel="icon"][sizes*="192"]').attr("href"),
  $('link[rel="icon"]').attr("href"),
  "/logo.svg", "/logo.png", "/images/logo.svg", "/images/logo.png",
  "/assets/logo.png", "/wp-content/uploads/logo.png",
].map(abs).filter(Boolean);

// Split into "looks like a real logo" vs "looks like a favicon". Try
// real logos first; only fall through to favicons if every real one fails.
const realLogoCandidates = logoCandidates.filter((u) => !isFaviconUrl(u));
const faviconCandidates  = logoCandidates.filter((u) =>  isFaviconUrl(u));

let logoBuf = null, logoUrl = null;
for (const u of [...realLogoCandidates, ...faviconCandidates]) {
  const buf = await fetchBuf(u);
  if (buf) { logoBuf = buf; logoUrl = u; break; }
}

// ── brand color (meta theme-color only — logo color extraction is V2) ─
const themeColor = ($('meta[name="theme-color"]').attr("content") || "").trim();

// ── phone / email ─────────────────────────────────────────────────────
const phone = ($('a[href^="tel:"]').first().attr("href") || "").replace(/^tel:/, "").trim();
const email = ($('a[href^="mailto:"]').first().attr("href") || "").replace(/^mailto:/, "").split("?")[0].trim();

// ── city / state ──────────────────────────────────────────────────────
// First try schema.org JSON-LD on the homepage. If that misses, try fetching
// /contact (where most firms put a full address). If that misses too, fall
// back to the phone's area code via a small lookup table.
const parseAddressFrom$ = ($doc) => {
  let c = "", s = "";
  $doc('script[type="application/ld+json"]').each((_, el) => {
    try {
      const ld = JSON.parse($doc(el).contents().text());
      const walk = (node) => {
        if (!node || typeof node !== "object") return;
        if (node.address && (node.address.addressLocality || node.address.addressRegion)) {
          c ||= node.address.addressLocality || "";
          s ||= node.address.addressRegion   || "";
        }
        for (const k of Object.keys(node)) walk(node[k]);
      };
      walk(ld);
    } catch {}
  });
  return { city: c, state: s };
};

let { city, state } = parseAddressFrom$($);
let citySource = (city || state) ? "homepage JSON-LD" : "";

if (!city && !state) {
  // Try /contact page — most firms put their address there even when the
  // homepage doesn't carry schema.org markup.
  for (const path of ["/contact", "/contact-us", "/locations", "/our-office"]) {
    try {
      const contactHtml = await fetchText(new URL(path, base).toString());
      const c$ = load(contactHtml);
      const parsed = parseAddressFrom$(c$);
      if (parsed.city || parsed.state) {
        city = parsed.city; state = parsed.state;
        citySource = path + " JSON-LD";
        break;
      }
    } catch {}
  }
}

// Phone area-code → city table for the top US legal markets. Used only as
// a last resort when JSON-LD missed entirely. We tag it as approximate so
// the human reviewer knows to double-check.
const AREA_CODE_CITY = {
  "212":"New York, NY","646":"New York, NY","917":"New York, NY","718":"Brooklyn, NY",
  "213":"Los Angeles, CA","310":"Los Angeles, CA","323":"Los Angeles, CA","424":"Los Angeles, CA",
  "818":"San Fernando Valley, CA","747":"San Fernando Valley, CA",
  "858":"San Diego, CA","619":"San Diego, CA",
  "415":"San Francisco, CA","628":"San Francisco, CA","510":"Oakland, CA",
  "916":"Sacramento, CA","408":"San Jose, CA","209":"Stockton, CA","559":"Fresno, CA",
  "312":"Chicago, IL","773":"Chicago, IL","872":"Chicago, IL","630":"Chicago, IL",
  "215":"Philadelphia, PA","267":"Philadelphia, PA","445":"Philadelphia, PA",
  "412":"Pittsburgh, PA","878":"Pittsburgh, PA",
  "305":"Miami, FL","786":"Miami, FL",
  "954":"Fort Lauderdale, FL","754":"Fort Lauderdale, FL",
  "561":"West Palm Beach, FL","813":"Tampa, FL","727":"St. Petersburg, FL",
  "407":"Orlando, FL","689":"Orlando, FL","321":"Orlando, FL",
  "904":"Jacksonville, FL","850":"Tallahassee, FL","239":"Fort Myers, FL",
  "404":"Atlanta, GA","470":"Atlanta, GA","678":"Atlanta, GA","770":"Atlanta, GA",
  "615":"Nashville, TN","629":"Nashville, TN","901":"Memphis, TN","865":"Knoxville, TN",
  "713":"Houston, TX","281":"Houston, TX","832":"Houston, TX","346":"Houston, TX",
  "214":"Dallas, TX","972":"Dallas, TX","469":"Dallas, TX","817":"Fort Worth, TX",
  "512":"Austin, TX","737":"Austin, TX","210":"San Antonio, TX","726":"San Antonio, TX",
  "602":"Phoenix, AZ","480":"Phoenix, AZ","623":"Phoenix, AZ","520":"Tucson, AZ",
  "702":"Las Vegas, NV","725":"Las Vegas, NV","775":"Reno, NV",
  "503":"Portland, OR","971":"Portland, OR","541":"Eugene, OR",
  "206":"Seattle, WA","425":"Bellevue, WA","253":"Tacoma, WA","509":"Spokane, WA",
  "303":"Denver, CO","720":"Denver, CO","719":"Colorado Springs, CO",
  "617":"Boston, MA","857":"Boston, MA","508":"Worcester, MA",
  "202":"Washington, DC","410":"Baltimore, MD","443":"Baltimore, MD","240":"Bethesda, MD",
  "612":"Minneapolis, MN","651":"St. Paul, MN","763":"Minneapolis, MN","952":"Minneapolis, MN",
  "314":"St. Louis, MO","636":"St. Louis, MO","816":"Kansas City, MO","573":"Columbia, MO",
  "504":"New Orleans, LA","225":"Baton Rouge, LA","337":"Lafayette, LA",
  "502":"Louisville, KY","859":"Lexington, KY",
  "317":"Indianapolis, IN","260":"Fort Wayne, IN",
  "216":"Cleveland, OH","513":"Cincinnati, OH","614":"Columbus, OH","330":"Akron, OH",
  "919":"Raleigh, NC","984":"Raleigh, NC","704":"Charlotte, NC","980":"Charlotte, NC","336":"Greensboro, NC",
  "803":"Columbia, SC","843":"Charleston, SC","864":"Greenville, SC",
  "808":"Honolulu, HI","313":"Detroit, MI","248":"Detroit, MI","616":"Grand Rapids, MI",
  "414":"Milwaukee, WI","608":"Madison, WI","920":"Green Bay, WI",
};

const areaCodeOf = (p) => {
  const digits = (p || "").replace(/\D/g, "");
  const normalized = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return normalized.length >= 10 ? normalized.slice(0, 3) : "";
};

if (!city && phone) {
  const ac = areaCodeOf(phone);
  const guess = AREA_CODE_CITY[ac];
  if (guess) {
    const [g_city, g_state] = guess.split(", ");
    city = g_city; state = g_state;
    citySource = "area code " + ac + " (approximate — verify)";
  }
}

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
  "agency: <FILL IN -- your agency name>",
  "agency_cta_label: Book your strategy call",
  "agency_cta_url: <FILL IN -- your booking link>",
  "agency_email: <FILL IN -- your email>",
  "prospect_firm: " + firmName,
  "prospect_attorney: <FILL IN -- lead attorney name>",
  "city: " + (city ? (city + (state ? ", " + state : "")) : "<FILL IN>"),
  "practice_area: " + (practiceArea || "<FILL IN -- personal injury | criminal | family | lemon law | workers comp | immigration | probate>"),
  "brand_color: " + (themeColor ? '"' + themeColor + '"' : '"#0B2A4A"  # not detected -- open their site, eyedropper their primary'),
  "case_type_wanted: <FILL IN -- e.g. car & truck accidents>",
  "local_notes: <FILL IN -- highways, weather, hospitals, anything that ties to their city>",
  "",
  "# Scraped reference (informational -- not consumed by generate-pitch.mjs):",
  "# source_url:  " + url,
  "# city_source: " + (citySource || "(not found)"),
  "# phone:       " + (phone || "(not found)"),
  "# email:       " + (email || "(not found)"),
  "# logo_source: " + (logoUrl || "(not found)"),
  "# logo_saved:  " + (logoPath || "(none)"),
  "",
].join("\n");

writeFileSync(join(outDir, "prospect.yml"), yaml);

console.log("✓ scraped → demos/" + slug + "/");
console.log("  firm:         " + firmName);
console.log("  city/state:   " + (city ? (city + (state ? ", " + state : "")) + (citySource.includes("area code") ? " (from " + citySource + ")" : "") : "(needs manual fill)"));
console.log("  practice:     " + (practiceArea || "(needs manual fill)"));
console.log("  brand color:  " + (themeColor || "(needs manual fill -- eyedropper from their site)"));
console.log("  phone:        " + (phone || "(not found)"));
console.log("  logo:         " + (logoPath || "(not found -- drop one into assets/ manually)"));
console.log("");
console.log("Next: review demos/" + slug + "/prospect.yml, fill the <FILL IN> markers, then");
console.log("ask Claude Code to generate pitch-content.json, then run tools/generate-pitch.mjs");
