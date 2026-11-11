// Génère les données du site à partir de l'aspiration de l'ancien site (ancien-site/) et des textes (scripts/content/*).
//   node scripts/build-data.mjs
// Sorties : data/pages.json, data/redirects.json, data/avis.json, data/videos.json, data/media-src.json, data/prestations.json
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { EVENTS, PURIM, CANDY, PRESTATIONS, CATS, CATALOG_PAGES } from "./content/core.mjs";
import { BIRTHDAY_HUB, PROGRAM, BOYS_GIRLS, THEMES, BIRTHDAY_AREAS, BIRTHDAY_EXTRA } from "./content/birthdays.mjs";
import { CLOWNS_HUB, REGIONS, CITIES, AGES, CLOWN_TOPICS, CITY_OPENERS, CITY_CLOSERS } from "./content/clowns.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const OLD = path.join(ROOT, "ancien-site");
const DATA = path.join(ROOT, "data");
fs.mkdirSync(DATA, { recursive: true });

const oldPages = new Map();
for (const f of fs.readdirSync(path.join(OLD, "pages"))) {
  const p = JSON.parse(fs.readFileSync(path.join(OLD, "pages", f), "utf8"));
  oldPages.set(p.url_decodee, p);
}
const state = JSON.parse(fs.readFileSync(path.join(OLD, "_state.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(OLD, "images/_manifest.json"), "utf8"));
const planches = JSON.parse(fs.readFileSync(path.join(OLD, "_planches/index.json"), "utf8"));
const byFile = new Map(Object.entries(manifest).filter(([, m]) => m.fichier).map(([k, m]) => [m.fichier, { key: k, ...m }]));
const origKey = (u) => u.replace(/\/sop-resize-\d+-/, "/").replace(/\?.*$/, "").replace(/^https?:\/\/(www\.)?2komi\.com\/image\//, "https://sfilev2.f-static.com/image/");

// ---------- Images ----------
const media = {}; // id -> { file, alt, w, h }
const idOf = (key) => crypto.createHash("md5").update(key).digest("hex").slice(0, 10);
const altFrom = (m) => {
  const raw = m.alt || path.basename(m.fichier).replace(/^[a-z-]+-\d{3}-/, "").replace(/\.[a-z]+$/, "");
  const first = raw.split(/\s*[_,|]\s*/)[0].replace(/-+/g, " ").replace(/0?5\d{8}/g, "").replace(/\d+/g, "").replace(/\s+/g, " ").trim();
  return /[א-ת]{3}/.test(first) ? first.slice(0, 80) : "";
};
// Photos écartées à la main (affiches chargées de texte, visages d'enfants en gros plan, doublons) : "catégorie:numéro" des planches
const EXCLUDE_REFS = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "content/exclude.json"), "utf8"));
const EXCLUDE = new Set(EXCLUDE_REFS.map((r) => { const [c, n] = r.split(":"); return planches[c]?.[+n]; }).filter(Boolean));
const okForGallery = (m) => {
  if (!m || !m.fichier || m.largeur < 600 || EXCLUDE.has(m.fichier)) return false;
  const ratio = m.largeur / (m.hauteur || 1);
  if (ratio > 2.1 || ratio < 0.45) return false; // bannières et bandeaux
  if (/\.png$/i.test(m.fichier)) return false;
  if (/באנר|כפתור|button|template|לוגו|logo|whatsapp-image-.*-at-\d{6}-\d|צילום-מסך|screenshot/i.test(m.fichier)) return false;
  return true;
};
const useImage = (m, alt) => {
  const id = idOf(m.key || m.fichier);
  media[id] ??= { file: m.fichier, alt: alt || altFrom(m), w: m.largeur, h: m.hauteur };
  if (alt && !media[id].altSet) Object.assign(media[id], { alt, altSet: true });
  return id;
};
const pickRef = (ref) => {
  const [cat, n] = ref.split(":");
  const f = planches[cat]?.[+n];
  const m = f && byFile.get(f);
  if (!m) throw new Error("Image introuvable : " + ref);
  return m;
};
function imagesFor(oldKeys, picks = [], max = 10) {
  const out = [];
  const seenFiles = new Set();
  const add = (m, alt) => {
    if (!m || seenFiles.has(m.fichier) || out.length >= max) return;
    seenFiles.add(m.fichier);
    out.push(useImage(m, alt));
  };
  for (const r of picks) { const m = pickRef(r); if (!EXCLUDE.has(m.fichier)) add(m); }
  for (const k of oldKeys) {
    const p = oldPages.get(k);
    if (!p) continue;
    for (const im of p.images) {
      if (im.type === "hors-contenu" || /^hors-contenu/.test(im.section || "")) continue;
      const m = manifest[origKey(im.url)];
      if (m && okForGallery(m)) add({ key: origKey(im.url), ...m }, im.alt || "");
    }
  }
  // La photo d'en-tête (la première) doit être assez grande : si elle est petite, on prend la plus large des 4 premières
  if (out.length > 1 && media[out[0]].w < 1100) {
    const best = out.slice(0, 4).reduce((a, b) => (media[b].w > media[a].w ? b : a));
    if (media[best].w >= 1280) { out.splice(out.indexOf(best), 1); out.unshift(best); }
  }
  return out;
}

// ---------- Texte de l'ancien site, nettoyé ----------
const menuLabels = new Set();
for (const p of oldPages.values()) for (const b of p.contenu) if (b.type === "li" && b.text.length < 200) menuLabels.add(b.text);
const NOISE = /^(דף הבית|חייגו עכשיו|טופס יצירת קשר|לחצו? כאן|לחץ כאן|הצטרפו לדף|לייבסיטי|ספר אורחים|הוסף חתימה|בטעינה|תגובות:|\+- הוסף|אין תמונות|כנסו תראו|האם תרצו|\(|>>|•)/;
const PHONE = /0?5\d[- ]?\d{3}[- ]?\d{4}|05\d{8}|0524-378733/g;
function cleanOld(oldKeys) {
  const out = [];
  const seen = new Set();
  for (const k of oldKeys) {
    const p = oldPages.get(k);
    if (!p) continue;
    let para = "";
    const flush = () => {
      const t = para.replace(/\s+/g, " ").trim();
      if (t.length > 30 && !seen.has(t)) { seen.add(t); out.push({ type: "p", text: t }); }
      para = "";
    };
    for (const b of p.contenu) {
      if (b.type === "img" || !b.text) continue;
      let t = b.text.replace(PHONE, "").replace(/\s*-\s*$/, "").replace(/\s{2,}/g, " ").trim();
      if (!t || NOISE.test(t) || menuLabels.has(b.text)) continue;
      if ((t.match(/\|/g) || []).length >= 2) continue; // lignes de mots-clés
      if (/^דוכני מזון \| תקליטן/.test(t) || /^(אטרקציות|הפקות) .*\|/.test(t)) continue;
      if (/^h\d$/.test(b.type)) {
        flush();
        if (t.length <= 70 && !seen.has("h:" + t)) { seen.add("h:" + t); out.push({ type: "h", text: t.replace(/\s*\|.*$/, "") }); }
        else if (t.length > 70) { para = t; flush(); }
        continue;
      }
      if (b.type === "li") { flush(); if (t.length > 3 && !seen.has(t)) { seen.add(t); out.push({ type: "li", text: t.replace(/^-\s*/, "") }); } continue; }
      t = t.replace(/^-\s*/, "");
      para += (para ? " " : "") + t;
      if (/[.!?:]$/.test(t) || para.length > 260) flush();
    }
    flush();
  }
  // Les titres courts consécutifs (légendes d'images) deviennent une liste
  const res = [];
  for (let i = 0; i < out.length; i++) {
    const b = out[i];
    if (b.type === "h" && b.text.length < 45 && out[i + 1]?.type === "h" && out[i + 1].text.length < 45) {
      const list = [];
      while (out[i]?.type === "h" && out[i].text.length < 45) list.push(out[i++].text);
      i--;
      res.push({ type: "tags", items: list });
      continue;
    }
    res.push(b);
  }
  // supprime un titre orphelin en fin de bloc
  while (res.length && res[res.length - 1].type === "h") res.pop();
  return res;
}

// ---------- Vidéos YouTube ----------
function videosFor(oldKeys) {
  const ids = [];
  for (const k of oldKeys) for (const v of oldPages.get(k)?.videos || []) {
    const id = /(?:embed\/|v\/|watch\?v=|youtu\.be\/)([\w-]{11})/.exec(v.src)?.[1];
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

// ---------- Pages ----------
const pages = [];
const redirects = {};
const claim = (oldKeys, to) => { for (const k of oldKeys) redirects[k] ??= to; };

function add(p) {
  const old = p.old || [];
  const page = {
    path: p.path,
    kind: p.kind,
    parent: p.parent || null,
    nav: p.nav || p.h1,
    title: p.title.length > 68 && p.shortTitle ? p.shortTitle : p.title,
    description: p.description.length < 95 ? `${p.description.replace(/[.\s]+$/, "")}. מקבלים הצעת מחיר מסודרת בוואטסאפ מקומי קומי הפקות.` : p.description,
    h1: p.h1,
    eyebrow: p.eyebrow || "",
    intro: p.intro || [],
    highlights: p.highlights || [],
    program: p.program || null,
    tags: [...new Set(cleanOld(old).filter((b) => b.type === "tags").flatMap((b) => b.items).map((t) => t.replace(/\s*[|,].*$/, "").replace(/\s+/g, " ").trim()).filter((t) => t.length > 3 && t.length < 38 && !/לחץ|לחצו|^\d/.test(t)))].slice(0, 24),
    // Texte de l'ancienne page, repris tel quel (lignes de mots-clés, menus et téléphones retirés)
    oldText: cleanOld(old).filter((b) => b.type !== "tags").map((b) => ({ type: b.type, text: b.text.replace(/^[|\s]+/, "") })).filter((b) => b.text.length > 2),
    reviews: [],
    images: imagesFor(old, p.pick || [], p.maxImages || 10),
    videos: videosFor(old).slice(0, 2),
    prestations: p.prestations || [],
    related: p.related || [],
    faq: p.faq || [],
    dark: !!p.dark,
    meta: p.meta || {},
  };
  pages.push(page);
  claim(old, p.path);
  return page;
}

// Événements principaux
for (const e of EVENTS) add(e);

// Pourim
for (const s of PURIM) add({
  path: `/purim/${s.slug}`, kind: "sub", parent: "/purim", nav: s.nav,
  title: `${s.h1} | קומי קומי הפקות`,
  description: s.intro, h1: s.h1, eyebrow: "פורים", intro: [s.intro],
  old: s.old, prestations: ["purim-stations", "fair-stands", "dj", "giant-puppets"],
  related: ["/purim", ...PURIM.filter((x) => x.slug !== s.slug).slice(0, 3).map((x) => `/purim/${x.slug}`)],
});

// Bars à bonbons
add(CANDY.hub);
for (const s of CANDY.subs) add({
  path: `/candy-bar/${s.slug}`, kind: "sub", parent: "/candy-bar", nav: s.nav,
  title: `${s.h1} | עיצוב בר מתוקים כשר – קומי קומי`, description: s.intro, h1: s.h1, eyebrow: "בר מתוקים",
  intro: [s.intro], old: s.old, prestations: ["candy-bar", "photo-walls", "magnets"],
  related: ["/candy-bar", ...CANDY.subs.filter((x) => x.slug !== s.slug).map((x) => `/candy-bar/${x.slug}`)],
});

// Anniversaires
add({ ...BIRTHDAY_HUB, program: PROGRAM, prestations: ["birthday-themes", "dj", "clowns", "candy-bar", "face-painting", "magnets"], related: ["/birthdays/boys", "/birthdays/girls", "/clowns", "/birthdays/dj"] });
for (const g of BOYS_GIRLS) {
  add({ ...g, kind: "sub", parent: "/birthdays", eyebrow: "ימי הולדת", program: PROGRAM, meta: { gender: g.gender }, prestations: ["birthday-themes", "dj", "candy-bar"], related: ["/birthdays", g.gender === "boys" ? "/birthdays/girls" : "/birthdays/boys"] });
}
const themesData = [];
for (const t of THEMES) {
  const g = t.gender === "boys" ? "לבנים" : t.gender === "girls" ? "לבנות" : "לבנים ולבנות";
  const p = add({
    path: `/birthdays/${t.slug}`, kind: "theme", parent: "/birthdays", nav: t.name,
    title: `יום הולדת ${t.name} | הפעלת יום הולדת ${t.name} – קומי קומי הפקות`,
    shortTitle: `יום הולדת ${t.name} | הפעלה ליום הולדת – קומי קומי`,
    description: `הפעלת יום הולדת ${t.name} ${g}, לגילאי ${t.ages[0]}–${t.ages[1]}: ${t.text}`.slice(0, 158),
    h1: `יום הולדת ${t.name}`, eyebrow: `יום הולדת ${g} · גילאי ${t.ages[0]}–${t.ages[1]}`,
    intro: [t.text, `ההפעלה מתאימה ${g} בגילאי ${t.ages[0]} עד ${t.ages[1]}, בבית, בגן או באולם.`],
    program: PROGRAM, old: t.old, maxImages: 8,
    meta: { gender: t.gender, ages: t.ages, theme: t.name },
    prestations: ["birthday-themes", "candy-bar", "dj", "magnets"],
    related: ["/birthdays", t.gender === "girls" ? "/birthdays/girls" : "/birthdays/boys"],
  });
  themesData.push({ slug: t.slug, name: t.name, gender: t.gender, ages: t.ages, text: t.text, image: p.images[0] || null });
}
for (const a of BIRTHDAY_AREAS) add({
  path: `/birthdays/${a.slug}`, kind: "area", parent: "/birthdays", nav: a.h1,
  title: `${a.h1} | קומי קומי הפקות`, description: a.text, h1: a.h1, eyebrow: `ימי הולדת · ${a.place}`,
  intro: [a.text], program: PROGRAM, old: a.old, prestations: ["birthday-themes", "clowns", "dj"],
  related: ["/birthdays", "/clowns", ...BIRTHDAY_AREAS.filter((x) => x.slug !== a.slug).slice(0, 2).map((x) => `/birthdays/${x.slug}`)],
});
for (const e of BIRTHDAY_EXTRA) add({ ...e, kind: "sub", parent: "/birthdays", eyebrow: "ימי הולדת", prestations: ["dj", "clowns", "birthday-themes"], related: ["/birthdays", "/clowns"] });

// Clowns
add({ ...CLOWNS_HUB, prestations: ["clowns", "face-painting", "dj", "shape-balloons"], related: ["/clowns/north", "/clowns/krayot", "/clowns/center", "/clowns/ages"] });
const regionName = Object.fromEntries(REGIONS.map((r) => [r.slug, r.name]));
const citiesData = [];
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
for (const [slug, name, inName, region, old] of CITIES) {
  const c = { slug, name, in: inName, region: regionName[region] };
  const sameRegion = CITIES.filter((x) => x[3] === region && x[0] !== slug);
  const h = hash(slug);
  const near = [0, 1, 2].map((i) => sameRegion[(h + i * 7) % sameRegion.length]?.[2]).filter((v, i, a) => v && a.indexOf(v) === i);
  const nearTxt = near.length > 1 ? near.slice(0, -1).join(", ") + " ו" + near[near.length - 1] : near[0] || "";
  const intro = [CITY_OPENERS[h % CITY_OPENERS.length](c), CITY_CLOSERS[(h >>> 3) % CITY_CLOSERS.length](c, nearTxt)];
  add({
    path: `/clowns/${slug}`, kind: "clown-city", parent: `/clowns/${region}`, nav: name,
    title: `ליצנים ${inName} | ליצן וליצנית ליום הולדת ${inName} – קומי קומי`,
    shortTitle: `ליצנים ${inName} | ליצן וליצנית ליום הולדת – קומי קומי`,
    description: `ליצנים ליום הולדת ${inName}: ליצנית וליצן, משחקים, ריקודים, איפור ופרסים לכל הילדים. ${regionName[region] === "הדרום" ? "בתיאום מראש." : "מגיעים לבית, לגן ולאולם."}`,
    h1: `ליצנים ליום הולדת ${inName}`, eyebrow: `ליצנים · ${regionName[region]}`,
    intro, highlights: CLOWNS_HUB.highlights.slice(0, 5), old, maxImages: 6,
    meta: { city: name, region },
    prestations: ["clowns", "face-painting", "dj", "candy-bar"],
    related: [`/clowns/${region}`, ...sameRegion.slice(0, 0)],
  });
  citiesData.push({ slug, name, in: inName, region, near: near.map((n) => CITIES.find((x) => x[2] === n)?.[0]).filter(Boolean) });
}
for (const r of REGIONS) add({
  path: `/clowns/${r.slug}`, kind: "clown-region", parent: "/clowns", nav: r.h1,
  title: `${r.h1} | ליצנים ליום הולדת ב${r.name.replace(/^ה/, "")} – קומי קומי`, description: r.text, h1: r.h1, eyebrow: "ליצנים לפי אזורים",
  intro: [r.text, CLOWNS_HUB.intro[1]], highlights: CLOWNS_HUB.highlights, old: r.old, maxImages: 6,
  meta: { region: r.slug }, prestations: ["clowns", "face-painting", "dj"], related: ["/clowns", "/clowns/ages"],
});
for (const a of AGES) add({
  path: `/clowns/${a.slug}`, kind: "clown-age", parent: "/clowns/ages", nav: a.title || `גיל ${a.age}`,
  title: `${a.title || `ליצנים לגיל ${a.age}`} | הפעלה ליום הולדת ${a.age} – קומי קומי`,
  description: `ליצנים ומפעילים ליום הולדת ${a.age}: ${a.text}`.slice(0, 158), h1: a.title || `ליצנים ליום הולדת ${a.age}`, eyebrow: "ליצנים לפי גילאים",
  intro: [a.text], highlights: CLOWNS_HUB.highlights.slice(0, 5), old: a.old, maxImages: 6, meta: { age: a.age },
  prestations: ["clowns", "dj", "face-painting"], related: ["/clowns/ages", "/birthdays"],
});
for (const t of CLOWN_TOPICS) add({
  path: `/clowns/${t.slug}`, kind: "clown-topic", parent: "/clowns", nav: t.h1, title: `${t.h1} | קומי קומי הפקות`, description: t.text, h1: t.h1, eyebrow: "ליצנים",
  intro: [t.text], highlights: t.slug === "ages" ? [] : CLOWNS_HUB.highlights.slice(0, 5), old: t.old, maxImages: 6,
  prestations: ["clowns", "dj", "face-painting"], related: ["/clowns"],
});

// Catalogue
for (const c of CATALOG_PAGES) {
  const pr = PRESTATIONS.find((x) => x.id === c.id);
  add({
    path: `/catalog/${c.id}`, kind: "catalog-item", parent: "/catalog", nav: pr?.name || c.h1, title: c.title, description: c.description, h1: c.h1,
    eyebrow: CATS[pr?.cat] || "קטלוג", intro: c.intro, highlights: c.highlights, old: c.old, pick: c.pick, meta: { prestation: c.id, priceFrom: pr?.priceFrom || null },
    prestations: [c.id], related: ["/catalog"],
  });
}

// ---------- Pages spéciales (rendues par leurs propres routes) ----------
claim(["/", "/site/index.asp?depart_id=106214", "/site/detail/departAlbum/albumPic.asp?category_id=45927&depart_id=106214"], "/");
claim(["/לקוחות-ממליצים.html", "/106214/המלצות", "/106214/קליפליצנים-קליפליצנית"], "/reviews");
for (const k of Object.keys(state.done)) if (/guestbook/.test(k)) claim([k], "/reviews");
claim(["/106214/צרו-קשר"], "/contact");

// Prestations (catalogue « panier »)
const prestations = PRESTATIONS.map((p) => ({ ...p, catLabel: CATS[p.cat], image: p.pick ? useImage(pickRef(p.pick)) : (pages.find((x) => x.path === p.page)?.images[0] || null) }));

// Images des pages spéciales (accueil) : décors et ambiances, pas de visages d'enfants en avant
const HOME_PICKS = {
  hero: "accueil:5",
  tiles: { "bar-mitzvah": "accueil:37", "bat-mitzvah": "accueil:19", "birthdays/boys": "anniversaires:11", "birthdays/girls": "anniversaires:34", "full-moon": "full-moon:4", purim: "pourim:16", corporate: "accueil:50", brit: "bar-matokim:12" },
  blocks: ["accueil:39", "accueil:29"],
  dj: "full-moon:9",
  mitzvah: "accueil:19",
  about: "accueil:43",
  gallery: ["accueil:16", "full-moon:9", "bar-matokim:16", "anniversaires:18", "accueil:32", "pourim:20", "accueil:43", "full-moon:11", "accueil:48", "anniversaires:25", "accueil:9", "bar-matokim:1"],
};
const home = {
  hero: useImage(pickRef(HOME_PICKS.hero), "שולחן מעוצב וקשתות מוארות בהפקת בר מצווה"),
  mitzvah: useImage(pickRef(HOME_PICKS.mitzvah), "קשת מוארת עם המספר 12 בכניסה לבת מצווה"),
  about: useImage(pickRef(HOME_PICKS.about)),
  dj: useImage(pickRef(HOME_PICKS.dj)),
  tiles: Object.fromEntries(Object.entries(HOME_PICKS.tiles).map(([k, r]) => [k, useImage(pickRef(r))])),
  blocks: HOME_PICKS.blocks.map((r) => useImage(pickRef(r))),
  gallery: HOME_PICKS.gallery.map((r) => useImage(pickRef(r))),
};

// Une page sans photo reprend celles de sa page parente (villes, âges, sous-pages sans image d'origine)
const byPath = new Map(pages.map((p) => [p.path, p]));
for (const p of pages) {
  let cur = p;
  while (!p.images.length && cur?.parent) { cur = byPath.get(cur.parent); if (cur?.images.length) { p.images = cur.images.slice(0, 4); p.inheritedImages = true; } }
  if (!p.images.length) { const hub = byPath.get("/" + p.path.split("/")[1]); if (hub?.images.length) { p.images = hub.images.slice(0, 4); p.inheritedImages = true; } }
}

// Redirections : toute URL visitée doit avoir une cible
const fallback = (k) => {
  if (/ליצ/.test(k)) return "/clowns";
  if (/פורים/.test(k)) return "/purim";
  if (/מתוק/.test(k)) return "/candy-bar";
  if (/יום-הולדת|יומולדת|ימי-הולדת/.test(k)) return "/birthdays";
  return "/";
};
const unmapped = [];
for (const k of Object.keys(state.done)) if (!redirects[k]) { redirects[k] = fallback(k); unmapped.push(k); }

// Avis du livre d'or (ספר המלצות) : texte seul, sans titre (noms de famille) ni email ; année et libellé court
const avisRaw = JSON.parse(fs.readFileSync(path.join(OLD, "avis-livre-d-or.json"), "utf8"));
const tagOf = (s) => /בת ה?מצו/.test(s) ? "בת מצווה" : /בר ה?מצו/.test(s) ? "בר מצווה" : /פול ?מון|FULL MOON/i.test(s) ? "פול מון" : /פורים/.test(s) ? "פורים" : /חברה|גיבוש/.test(s) ? "אירוע חברה" : /כובע|גרפיטי/.test(s) ? "גרפיטי" : /חנוכה/.test(s) ? "חנוכה" : /קריוקי/.test(s) ? "קריוקי" : "יום הולדת";
const SKIP_AVIS = new Set([92, 66, 30, 81]); // message de la famille + doublons « suite »
const avis = avisRaw.map((a, i) => ({
  id: i,
  year: +a.date.slice(6, 10),
  tag: tagOf(a.titre + " " + a.texte),
  text: a.texte.replace(/\s*\n\s*/g, " ").replace(/\s{2,}/g, " ").replace(/([!?.])\1{2,}/g, "$1$1").replace(/([א-ת])\1{3,}/g, "$1").trim(),
  _hay: a.titre + " " + a.texte,
})).filter((a) => !SKIP_AVIS.has(a.id) && a.text.length > 40);
const FEATURED = [0, 23, 14, 4, 34, 1, 35, 6, 46];

// Avis rattachés aux pages : ville, thème ou type d'événement cité dans le message
const CITY_RX = {
  haifa: /חיפה/, nahariya: /נהריה/, karmiel: /כרמיאל/, maalot: /מעלות/, yokneam: /יו?קנעם/, "tel-aviv": /תל אביב|ת''א|מת"א/, "kfar-saba": /כפר סבא/, "kiryat-ono": /קרית אונו|קריית אונו/,
  caesarea: /קי?סריה/, "kiryat-bialik": /ביאליק/, "kiryat-motzkin": /מוצקין/, "kiryat-yam": /קרית ים|קריית ים/, "kiryat-ata": /קרית אתא|קריית אתא/,
};
const REGION_RX = { krayot: /קריות|ביאליק|מוצקין|קרית ים|קרית אתא/, north: /צפון|חיפה|יו?קנעם|עכו|כרמיאל/, "upper-galilee": /נהריה|מעלות|כרמיאל|גליל/, center: /תל אביב|ת''א|כפר סבא|קרית אונו/ };
const THEME_RX = { pokemon: /פוקימון/, football: /כדורגל/, spa: /ספא/, "glow-party": /פול ?מון|FULL MOON/i, "boys-and-girls": /הבנים והבנות/ };
const PATH_RX = {
  "/bar-mitzvah": /בר ה?מצו/, "/bar-mitzvah/dj": /בר ה?מצו/, "/bat-mitzvah": /בת ה?מצו/, "/bat-mitzvah/dj": /תקליטן.*בת ה?מצו|בת ה?מצו.*תקליטן/, "/full-moon": /פול ?מון|FULL MOON/i, "/full-moon/bat-mitzvah": /פול ?מון|FULL MOON/i,
  "/purim": /פורים/, "/corporate": /חברה|גיבוש|ועד הורים|ישוב/, "/birthdays/dj": /תקליטן ליום|תקליטן לילדים|דיסקו/, "/catalog/graffiti-hats": /כובע/, "/catalog/food-stands": /דוכני/, "/catalog/karaoke": /קריוקי/,
  "/clowns": /ליצנ/, "/birthdays": /יום ה?הולדת|יומולדת/, "/birthdays/boys": /כדורגל|לבני |לבן שלי|בננו/, "/birthdays/girls": /ספא|לבתי|לביתנו|לבתנו/,
};
const AGE_RX = (n) => new RegExp(`(גיל|בן ה?-?|בת ה?-?|הולדת) ?${n}(?![0-9])`);
const pickAvis = (rx, max = 3) => avis.filter((a) => rx.test(a._hay)).sort((a, b) => a.text.length - b.text.length).slice(0, max).map((a) => a.id);
for (const p of pages) {
  const seg = p.path.split("/").pop();
  let rx = PATH_RX[p.path];
  if (p.kind === "clown-city") rx = CITY_RX[seg];
  else if (p.kind === "clown-region") rx = REGION_RX[seg];
  else if (p.kind === "clown-age") rx = AGE_RX(p.meta.age);
  else if (p.kind === "theme") rx = THEME_RX[seg];
  else if (p.kind === "area") rx = seg.includes("football") ? /כדורגל/ : CITY_RX[seg] || REGION_RX[seg];
  else if (p.path.startsWith("/purim/")) rx = /פורים/;
  if (rx) p.reviews = pickAvis(rx);
}
for (const a of avis) delete a._hay;

// ---------- Écriture ----------
const write = (f, d) => fs.writeFileSync(path.join(DATA, f), JSON.stringify(d, null, 1) + "\n");
pages.sort((a, b) => a.path.localeCompare(b.path));
write("pages.json", pages);
write("redirects.json", redirects);
write("avis.json", { featured: FEATURED, items: avis });
write("prestations.json", { cats: CATS, items: prestations });
write("themes.json", themesData);
write("villes.json", { regions: REGIONS.map(({ slug, name, h1 }) => ({ slug, name, h1 })), cities: citiesData });
write("home.json", home);
const allVideos = [...new Set([...oldPages.values()].flatMap((p) => videosFor([p.url_decodee])))];
write("videos.json", { reviews: videosFor(["/106214/המלצות", "/לקוחות-ממליצים.html", "/106214/קליפליצנים-קליפליצנית"]), all: allVideos });
write("media-src.json", media);
console.log(`${pages.length} pages, ${Object.keys(redirects).length} redirections (${unmapped.length} vers une page parente), ${Object.keys(media).length} images, ${avis.length} avis, ${allVideos.length} vidéos`);
if (unmapped.length) console.log("Redirigées vers une page parente :\n  " + unmapped.join("\n  "));
