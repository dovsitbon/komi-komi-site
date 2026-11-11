// Télécharge toutes les images trouvées par le crawl, en version originale quand elle existe
// (LiveCity sert des copies réduites « sop-resize-600- » : on tente d'abord le fichier d'origine).
import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";
import { categorieDe } from "./categorie.mjs";

const ROOT = path.resolve(import.meta.dirname, "../../ancien-site");
const PAGES = path.join(ROOT, "pages");
const OUT = path.join(ROOT, "images");
const MANIFEST = path.join(OUT, "_manifest.json");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dec = (s) => { try { return decodeURIComponent(s); } catch { return s; } };

// Ignore les pictos de la plateforme
const JUNK = /livecity|includeNew|\/site\/|facebook\.com\/tr|googleads|doubleclick|\/bgcolor\/|spacer|\.gif(\?|$)/i;

const original = (u) => u.replace(/\/sop-resize-\d+-/, "/").replace(/\?.*$/, "").replace(/^https?:\/\/(www\.)?2komi\.com\/image\//, "https://sfilev2.f-static.com/image/");

const pages = fs.readdirSync(PAGES).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(PAGES, f), "utf8")));
// les pages de contenu d'abord, l'accueil ensuite, pour classer chaque image dans sa vraie catégorie
pages.sort((a, b) => (a.url_decodee === "/" ? 1 : 0) - (b.url_decodee === "/" ? 1 : 0));

const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {};
const items = new Map();
for (const p of pages) {
  for (const im of p.images) {
    if (JUNK.test(im.url) || !/^https?:/.test(im.url)) continue;
    if (!/f-static\.com\/image\/users\/106214|2komi\.com/i.test(im.url)) continue;
    const key = original(im.url);
    const it = items.get(key) || { key, variantes: new Set(), pages: [], alt: "", section: "", hors_contenu: true };
    it.variantes.add(im.url);
    if (!it.pages.includes(p.url_decodee)) it.pages.push(p.url_decodee);
    if (!it.alt && im.alt) it.alt = im.alt;
    if (!it.section && im.section && !/^hors-contenu/.test(im.section)) it.section = im.section;
    if (im.type !== "hors-contenu") it.hors_contenu = false;
    items.set(key, it);
  }
}
console.log(`${items.size} images uniques`);

const counters = {};
const safe = (s) => s.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 60).replace(/^-|-$/g, "");

async function get(url) {
  for (let a = 0; a < 3; a++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA, Referer: "https://www.2komi.com/" } });
      if (r.ok && /image/.test(r.headers.get("content-type") || "")) return Buffer.from(await r.arrayBuffer());
      if (r.status < 500 || r.status === 500) return null; // 404, 500 (fichier absent) ou page HTML : inutile de réessayer
    } catch {}
    await sleep(3000 * (a + 1));
  }
  return null;
}

let n = 0;
const todo = [...items.values()];
async function worker() {
while (todo.length) {
  const it = todo.shift();
  n++;
  if (manifest[it.key]?.fichier) continue;
  const cat = it.hors_contenu && it.pages.length > 3 ? "commun" : categorieDe(it.pages.find((k) => k !== "/") || it.pages[0]);
  counters[cat] = (counters[cat] || Object.values(manifest).filter((m) => m.categorie === cat).length) + 1;
  const baseName = safe(it.alt || dec(path.basename(it.key)).replace(/\.[a-z0-9]+$/i, ""));
  // essaie l'original, puis chaque variante (de la plus grande à la plus petite)
  const candidates = [it.key, ...[...it.variantes].sort((a, b) => (+(/resize-(\d+)/.exec(b)?.[1] || 9999)) - (+(/resize-(\d+)/.exec(a)?.[1] || 9999)))];
  let buf = null, used = null;
  for (const c of candidates) { buf = await get(c); if (buf) { used = c; break; } await sleep(200); }
  if (!buf) { manifest[it.key] = { erreur: "introuvable", pages: it.pages }; console.log(`  x ${dec(it.key)}`); continue; }
  let dim = {};
  try { dim = imageSize(buf); } catch {}
  const ext = (dim.type === "jpg" ? "jpg" : dim.type) || path.extname(it.key).slice(1) || "jpg";
  const dir = path.join(OUT, cat);
  fs.mkdirSync(dir, { recursive: true });
  const fichier = `${cat}-${String(counters[cat]).padStart(3, "0")}-${baseName}.${ext}`;
  fs.writeFileSync(path.join(dir, fichier), buf);
  manifest[it.key] = {
    fichier: `${cat}/${fichier}`, categorie: cat, source: used, original: used === it.key,
    largeur: dim.width || 0, hauteur: dim.height || 0, octets: buf.length,
    alt: it.alt, section: it.section, pages: it.pages,
  };
  if (n % 20 === 0) { fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2)); console.log(`${n}/${items.size}`); }
  await sleep(250);
}
}
await Promise.all([worker(), worker(), worker(), worker()]);
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log("Images terminées");
