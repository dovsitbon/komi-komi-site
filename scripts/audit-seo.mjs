// Audit SEO de toutes les pages du sitemap : title, description, H1, canonical, données structurées, images sans alt,
// liens internes cassés et pages orphelines. Lit le HTML rendu (site lancé en local ou URL en argument).
//   node scripts/audit-seo.mjs [base]
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const base = (process.argv[2] || "http://localhost:3287").replace(/\/$/, "");
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "data/site.json"), "utf8"));

const xml = await (await fetch(base + "/sitemap.xml")).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(site.url, "") || "/");
const pick = (html, re) => (re.exec(html)?.[1] || "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'");
const issues = [];
const titles = new Map(), descs = new Map(), inbound = new Map(urls.map((u) => [u, 0]));
const linked = new Set();
let ld = 0, imgs = 0;

for (const u of urls) {
  const res = await fetch(base + encodeURI(u));
  if (res.status !== 200) { issues.push(`${res.status} ${u}`); continue; }
  const html = await res.text();
  const title = pick(html, /<title>([^<]*)<\/title>/);
  const desc = pick(html, /<meta name="description" content="([^"]*)"/);
  const canonical = pick(html, /<link rel="canonical" href="([^"]*)"/);
  const h1 = [...html.matchAll(/<h1[\s>]/g)].length;
  if (!title) issues.push(`title manquant ${u}`);
  if (title.length > 70) issues.push(`title long (${title.length}) ${u}`);
  if (desc.length < 70) issues.push(`description courte (${desc.length}) ${u}`);
  if (desc.length > 165) issues.push(`description longue (${desc.length}) ${u}`);
  if (h1 !== 1) issues.push(`${h1} H1 ${u}`);
  if (decodeURI(canonical.replace(site.url, "") || "/") !== u) issues.push(`canonical ${canonical} ≠ ${u}`);
  if (!/translate="no"/.test(html) || !/name="google" content="notranslate"/.test(html) || !/<body class="[^"]*notranslate/.test(html)) issues.push(`balises notranslate manquantes ${u}`);
  (titles.get(title) || titles.set(title, []).get(title)).push(u);
  (descs.get(desc) || descs.set(desc, []).get(desc)).push(u);
  ld += [...html.matchAll(/application\/ld\+json/g)].length;
  for (const m of html.matchAll(/<img\b[^>]*>/g)) { imgs++; if (!/\balt="[^"]+"/.test(m[0]) && !/ytimg|aria-hidden="true"/.test(m[0])) issues.push(`image sans alt ${u}`); }
  for (const m of html.matchAll(/<a\b[^>]*href="(\/[^"#?]*)/g)) {
    const to = decodeURI(m[1]).replace(/\/$/, "") || "/";
    linked.add(to);
    if (to !== u && inbound.has(to)) inbound.set(to, inbound.get(to) + 1);
  }
}
for (const [t, list] of titles) if (list.length > 1) issues.push(`title en double : « ${t.slice(0, 50)} » ${list.join(" ")}`);
for (const [d, list] of descs) if (list.length > 1) issues.push(`description en double : ${list.join(" ")}`);
for (const [u, n] of inbound) if (n === 0 && u !== "/") issues.push(`page orpheline ${u}`);
const known = new Set([...urls, "/legal"]);
for (const l of linked) if (!known.has(l) && !l.startsWith("/_next") && !l.startsWith("/media")) issues.push(`lien interne vers une page absente du sitemap : ${l}`);

console.log(`${urls.length} pages, ${imgs} images, ${ld} blocs JSON-LD, ${issues.length} points à corriger`);
console.log(issues.slice(0, 60).join("\n"));
process.exit(issues.length ? 1 : 0);
