// Crawl poli de https://www.2komi.com/ (LiveCity, HTML statique).
// Usage : node crawl.mjs   (reprend là où il s'est arrêté grâce à state.json)
import * as cheerio from "cheerio";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = path.resolve(import.meta.dirname, "../../ancien-site");
const HTML_DIR = path.join(ROOT, "html");
const PAGES_DIR = path.join(ROOT, "pages");
const STATE = path.join(ROOT, "_state.json");
fs.mkdirSync(HTML_DIR, { recursive: true });
fs.mkdirSync(PAGES_DIR, { recursive: true });

const ORIGIN = "https://www.2komi.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const ASSET = /\.(css|js|gif|png|jpe?g|webp|svg|ico|woff2?|ttf|eot|pdf|swf|mp4|mp3|zip|xml)(\?|$)/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const safeDecode = (s) => {
  try { return decodeURIComponent(s); } catch { return s; }
};

// Clé canonique : chemin décodé + query (sans fragment), host www.2komi.com
function normalize(href, base) {
  if (!href) return null;
  href = href.trim();
  if (/^(javascript:|mailto:|tel:|#|whatsapp:)/i.test(href)) return null;
  let u;
  try { u = new URL(href, base); } catch { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  const host = u.hostname.toLowerCase();
  if (host !== "2komi.com" && host !== "www.2komi.com") return { external: u.href };
  if (ASSET.test(u.pathname)) return { asset: u.href };
  let p = safeDecode(u.pathname) || "/";
  return { key: p + (u.search ? safeDecode(u.search) : "") };
}

function slugFor(key) {
  if (key === "/") return "accueil";
  let s = key.replace(/^\/+/, "").replace(/\.html$/i, "").replace(/[\/?=&]+/g, "__");
  s = s.replace(/[<>:"\\|*]/g, "_").replace(/\s+/g, "-");
  if (s.length > 90) s = s.slice(0, 90) + "-" + crypto.createHash("md5").update(key).digest("hex").slice(0, 6);
  return s;
}

const encodeKey = (key) => {
  const [p, q] = key.split(/\?(.*)/s);
  return ORIGIN + encodeURI(p) + (q ? "?" + encodeURI(q).replace(/#/g, "%23") : "");
};

async function fetchWithRetry(url) {
  const waits = [8000, 20000];
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, "Accept-Language": "he-IL,he;q=0.9,en;q=0.8", Accept: "text/html,*/*" },
        redirect: "manual",
      });
      if (res.status >= 300 && res.status < 400) return { status: res.status, location: res.headers.get("location"), html: "" };
      if (res.status === 500 && attempt >= 1) return { status: 500, html: "" };
      if (res.status === 429 || res.status >= 500) throw new Error("HTTP " + res.status);
      return { status: res.status, html: await res.text() };
    } catch (e) {
      if (attempt >= waits.length) return { status: 0, error: String(e), html: "" };
      console.log(`  ! ${e.message} — nouvel essai dans ${waits[attempt] / 1000}s`);
      await sleep(waits[attempt]);
    }
  }
}

const clean = (t) => t.replace(/\u00a0/g, " ").replace(/[ \t\r\f\v]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();

// Transforme le contenu en blocs structurés (titres, paragraphes, listes, images) dans l'ordre du document
function extractBlocks($, root) {
  const blocks = [];
  let buf = "";
  let currentSection = "";
  const flush = () => {
    const t = clean(buf);
    if (t) for (const line of t.split("\n")) if (line.trim()) blocks.push({ type: "p", text: line.trim() });
    buf = "";
  };
  const BLOCK = new Set(["p", "div", "table", "tr", "td", "th", "tbody", "section", "article", "center", "blockquote", "form", "ul", "ol"]);
  function walk(node) {
    if (node.type === "text") { buf += node.data; return; }
    if (node.type !== "tag") return;
    const tag = node.name.toLowerCase();
    if (["script", "style", "noscript", "iframe", "object", "embed", "select", "option"].includes(tag)) return;
    const $n = $(node);
    if (/^h[1-6]$/.test(tag) || $n.hasClass("tool_header")) {
      flush();
      const t = clean($n.text()).replace(/\n/g, " ");
      if (t) { blocks.push({ type: /^h[1-6]$/.test(tag) ? tag : "h2", text: t }); currentSection = t; }
      return;
    }
    if (tag === "li") { flush(); const t = clean($n.text()).replace(/\n/g, " "); if (t) blocks.push({ type: "li", text: t }); return; }
    if (tag === "br") { buf += "\n"; return; }
    if (tag === "img") {
      flush();
      blocks.push({ type: "img", src: $n.attr("src") || "", alt: $n.attr("alt") || "", section: currentSection });
      return;
    }
    const isBlock = BLOCK.has(tag);
    if (isBlock) flush();
    for (const c of node.children || []) walk(c);
    if (isBlock) flush();
  }
  walk(root);
  flush();
  // déduplique les lignes consécutives identiques
  return blocks.filter((b, i) => !(i > 0 && b.type === blocks[i - 1].type && b.text && b.text === blocks[i - 1].text));
}

// Menu (catégories parentes) lu depuis la page d'accueil
const menu = {};
function parseMenu($) {
  $("#MenuBar1 > li").each((i, li) => {
    const a = $(li).children("div").find("a").first();
    const parentLabel = clean(a.text());
    const n = normalize(a.attr("href"), ORIGIN + "/");
    if (n?.key) menu[n.key] ??= { niveau: 1, ordre: i + 1, libelle_menu: parentLabel, parent: null };
    $(li).find("ul li a").each((j, sa) => {
      const sn = normalize($(sa).attr("href"), ORIGIN + "/");
      if (sn?.key) menu[sn.key] ??= { niveau: 2, ordre: j + 1, libelle_menu: clean($(sa).text()), parent: parentLabel };
    });
  });
}

function extractPage(key, url, html, status) {
  const $ = cheerio.load(html);
  if (key === "/") parseMenu($);
  const meta = (n) => $(`meta[name="${n}"], meta[name='${n}']`).attr("content") || $(`meta[name=${n}]`).attr("content") || "";
  const contentRoot = $("#centerWebsiteDiv").get(0) || $("body").get(0);
  const $c = $(contentRoot);

  const images = [];
  const seenImg = new Set();
  const addImg = (src, alt, section, extra = {}) => {
    if (!src) return;
    let abs;
    try { abs = new URL(src, url).href; } catch { return; }
    if (/\/(bgcolor|includeNew|images\/(spacer|blank))/i.test(abs) || /spacer|pixel|blank\.gif/i.test(abs)) return;
    if (seenImg.has(abs)) return;
    seenImg.add(abs);
    images.push({ url: abs, alt: clean(alt || ""), section, ...extra });
  };
  // images dans le contenu, avec section = dernier titre rencontré
  const blocks = extractBlocks($, contentRoot);
  for (const b of blocks) if (b.type === "img") {
    const el = $c.find(`img[src="${b.src}"]`).first();
    const link = el.closest("a").attr("href") || "";
    const title = el.attr("title") || "";
    addImg(b.src, b.alt, b.section, { titre: title, lien: link, largeur_attr: el.attr("width") || "", hauteur_attr: el.attr("height") || "" });
  }
  // liens vers images (version grande taille)
  $c.find("a[href]").each((_, a) => {
    const h = $(a).attr("href");
    if (/\.(jpe?g|png|webp|gif)(\?|$)/i.test(h || "")) addImg(h, $(a).find("img").attr("alt") || $(a).attr("title") || "", "", { type: "lien-image" });
  });
  // images de fond
  $c.find("[style*='url(']").each((_, el) => {
    const m = /url\(['"]?([^'")]+)/i.exec($(el).attr("style"));
    if (m) addImg(m[1], "", "", { type: "fond" });
  });
  // images hors contenu (menus latéraux, tuiles, footer)
  $("img").each((_, el) => {
    if ($c.find(el).length) return;
    addImg($(el).attr("src"), $(el).attr("alt"), "hors-contenu (" + ($(el).closest("[id]").attr("id") || "") + ")", { type: "hors-contenu" });
  });

  const videos = [];
  $("iframe, embed, object, video, source").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data") || $(el).find("param[name=movie]").attr("value") || "";
    if (src) videos.push({ tag: el.name, src: src.startsWith("//") ? "https:" + src : src });
  });
  $("a[href*='youtube.com'], a[href*='youtu.be'], a[href*='facebook.com/watch'], a[href*='/videos/']").each((_, a) => {
    videos.push({ tag: "a", src: $(a).attr("href"), texte: clean($(a).text()) });
  });

  const internes = [], externes = [];
  const seenL = new Set();
  $("a[href]").each((_, a) => {
    const href = $(a).attr("href");
    const n = normalize(href, url);
    const txt = clean($(a).text()).replace(/\n/g, " ");
    const inContent = $c.find(a).length > 0;
    if (!n) return;
    if (n.key) { const k = "i" + n.key; if (!seenL.has(k)) { seenL.add(k); internes.push({ url: n.key, texte: txt, dans_contenu: inContent }); } }
    else if (n.external) { const k = "e" + n.external; if (!seenL.has(k)) { seenL.add(k); externes.push({ url: n.external, texte: txt }); } }
  });

  const forms = [];
  $("form").each((_, f) => {
    const fields = [];
    $(f).find("input, textarea, select").each((_, el) => {
      const $e = $(el);
      const type = el.name === "input" ? $e.attr("type") || "text" : el.name;
      if (["hidden", "submit", "button", "image"].includes(type)) { if (type !== "hidden") fields.push({ type, valeur: $e.attr("value") || "" }); return; }
      const id = $e.attr("id");
      const label = (id && clean($(`label[for="${id}"]`).text())) || clean($e.closest("tr").find("td").first().text()) || $e.attr("placeholder") || "";
      fields.push({ type, name: $e.attr("name") || "", label, obligatoire: $e.attr("required") !== undefined });
    });
    forms.push({ action: $(f).attr("action") || "", method: $(f).attr("method") || "", champs: fields });
  });

  const h1 = clean($c.find("h1").first().text()) || clean($("h1").first().text());
  return {
    url_decodee: key,
    url_encodee: encodeKey(key),
    statut_http: status,
    title: clean($("title").first().text()),
    meta_description: meta("description"),
    meta_keywords: meta("keywords"),
    h1,
    titres: blocks.filter((b) => /^h\d$/.test(b.type)).map((b) => `${b.type}: ${b.text}`),
    canonical: $("link[rel=canonical]").attr("href") || "",
    og_image: $("meta[property='og:image']").attr("content") || "",
    contenu: blocks.map((b) => (b.type === "img" ? { type: "img", src: new URL(b.src || "x", url).href, alt: b.alt } : b)),
    images,
    videos,
    liens_internes: internes,
    liens_externes: externes,
    formulaires: forms,
    _links: internes.map((l) => l.url),
  };
}

// ---- boucle principale ----
let state = fs.existsSync(STATE)
  ? JSON.parse(fs.readFileSync(STATE, "utf8"))
  : { queue: ["/"], done: {}, external: {}, assets: {} };

const enqueue = (k) => {
  if (state.done[k] || state.queue.includes(k)) return;
  // ignore les pages d'admin / panier LiveCity sans contenu
  if (/^\/site\/(admin|login|shop\/cart|members)/i.test(k)) return;
  state.queue.push(k);
};

let count = Object.keys(state.done).length;
while (state.queue.length) {
  const key = state.queue.shift();
  if (state.done[key]) continue;
  const url = encodeKey(key);
  count++;
  console.log(`[${count}] ${key}  (reste ${state.queue.length})`);
  const r = await fetchWithRetry(url);
  const slug = slugFor(key);
  if (r.location) {
    const n = normalize(r.location, url);
    state.done[key] = { slug, statut: r.status, redirection: r.location };
    if (n?.key) enqueue(n.key);
  } else if (r.status === 200 && r.html) {
    fs.writeFileSync(path.join(HTML_DIR, slug + ".html"), r.html);
    const data = extractPage(key, url, r.html, r.status);
    data.menu = null; // complété à l'inventaire
    for (const l of data._links) enqueue(l);
    for (const e of data.liens_externes) state.external[e.url] = (state.external[e.url] || 0) + 1;
    delete data._links;
    fs.writeFileSync(path.join(PAGES_DIR, slug + ".json"), JSON.stringify(data, null, 2));
    state.done[key] = { slug, statut: 200 };
  } else {
    state.done[key] = { slug, statut: r.status, erreur: r.error || "" };
  }
  if (key === "/") state.menu = menu;
  fs.writeFileSync(STATE, JSON.stringify(state, null, 2));
  await sleep(2000 + Math.random() * 1000);
}
console.log(`Terminé : ${Object.keys(state.done).length} URLs traitées.`);

// ---- Pages mortes (500) : récupération depuis la Wayback Machine (node crawl.mjs, après le crawl) ----
const wbPath = path.join(ROOT, "_wayback.json");
if (fs.existsSync(wbPath)) {
  const wb = JSON.parse(fs.readFileSync(wbPath, "utf8"));
  for (const [key, snap] of Object.entries(wb)) {
    if (!snap || state.done[key]?.source === "wayback") continue;
    const raw = `https://web.archive.org/web/${snap.ts}id_/${encodeKey(key)}`;
    const res = await fetch(raw, { headers: { "User-Agent": UA } }).catch(() => null);
    if (!res?.ok) { console.log("wayback KO", key); continue; }
    const html = await res.text();
    const slug = slugFor(key);
    fs.writeFileSync(path.join(HTML_DIR, slug + ".html"), html);
    const data = extractPage(key, encodeKey(key), html, 200);
    delete data._links;
    data.source = `Wayback Machine ${snap.ts.slice(0, 4)}-${snap.ts.slice(4, 6)}-${snap.ts.slice(6, 8)} (page en erreur 500 sur le site actuel)`;
    data.statut_http = 500;
    fs.writeFileSync(path.join(PAGES_DIR, slug + ".json"), JSON.stringify(data, null, 2));
    state.done[key] = { slug, statut: 500, source: "wayback", archive: snap.ts };
    fs.writeFileSync(STATE, JSON.stringify(state, null, 2));
    console.log("wayback OK", snap.ts, key, data.title.slice(0, 60));
    await sleep(2000);
  }
}
