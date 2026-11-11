// Construit les livrables de l'étape 1 à partir de pages/*.json, html/ et images/_manifest.json
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { categorieDe } from "./categorie.mjs";

const ROOT = path.resolve(import.meta.dirname, "../../ancien-site");
const state = JSON.parse(fs.readFileSync(path.join(ROOT, "_state.json"), "utf8"));
const manifestPath = path.join(ROOT, "images/_manifest.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};
// Menu reconstruit en arbre (plusieurs niveaux) depuis le HTML de l'accueil
const menu = {};
const menuTree = [];
{
  const $m = cheerio.load(fs.readFileSync(path.join(ROOT, "html/accueil.html"), "utf8"));
  const keyOf = (href) => {
    try { const u = new URL(href, "https://www.2komi.com/"); if (!/2komi\.com$/.test(u.hostname)) return null; let k = decodeURIComponent(u.pathname) + (u.search ? decodeURIComponent(u.search) : ""); return k || "/"; } catch { return null; }
  };
  const walk = ($ul, parent, niveau, into) => {
    $ul.children("li").each((i, li) => {
      const a = $m(li).find("a").first();
      const libelle = a.text().replace(/\s+/g, " ").trim();
      const key = keyOf(a.attr("href"));
      const node = { key, libelle, niveau, enfants: [] };
      into.push(node);
      if (key) menu[key] ??= { niveau, ordre: i + 1, libelle_menu: libelle, parent, parent_key: null };
      const sub = $m(li).children("ul");
      if (sub.length) walk(sub, libelle, niveau + 1, node.enfants);
    });
  };
  walk($m("#MenuBar1"), null, 1, menuTree);
}

const pages = fs.readdirSync(path.join(ROOT, "pages")).filter((f) => f.endsWith(".json"))
  .map((f) => ({ slug: f.replace(/\.json$/, ""), ...JSON.parse(fs.readFileSync(path.join(ROOT, "pages", f), "utf8")) }));
const byKey = new Map(pages.map((p) => [p.url_decodee, p]));

// ---- lignes communes (menu latéral, pied de page) : présentes sur plus de 40 % des pages ----
const freq = new Map();
for (const p of pages) {
  const seen = new Set(p.contenu.filter((b) => b.text).map((b) => b.text));
  for (const t of seen) freq.set(t, (freq.get(t) || 0) + 1);
}
const commun = new Set([...freq].filter(([, n]) => n > pages.length * 0.4).map(([t]) => t));
const propre = (p) => p.contenu.filter((b) => b.type === "img" || !commun.has(b.text));

// ---- menu : catégorie parente, compléter les pages ----
for (const p of pages) {
  p.menu = menu[p.url_decodee] || null;
  p.categorie = categorieDe(p.url_decodee);
  fs.writeFileSync(path.join(ROOT, "pages", p.slug + ".json"), JSON.stringify(Object.fromEntries(Object.entries(p).filter(([k]) => k !== "slug")), null, 2));
}

const resume = (p) => {
  const t = propre(p).filter((b) => b.type === "p" && b.text && b.text.length > 50 && !/^\(|^דף הבית/.test(b.text) && (b.text.match(/[|,]/g) || []).length < 3 && !p.title.includes(b.text.slice(0, 25))).map((b) => b.text)[0] || propre(p).find((b) => b.text)?.text || "";
  return t.length > 160 ? t.slice(0, 157) + "…" : t;
};
const md = (s) => (s || "").replace(/\|/g, "\\|");
const csv = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const imgCount = (p) => p.images.filter((i) => !/^hors-contenu/.test(i.section || "") && i.type !== "hors-contenu").length;

// ---- arborescence ----
const menuKeys = Object.entries(menu).sort((a, b) => 0);
const top = menuTree.map((n) => [n.key, { libelle_menu: n.libelle, node: n }]);
const flat = (n) => [n.key, ...n.enfants.flatMap(flat)];
const enfants = () => [];
const horsMenu = pages.filter((p) => !menu[p.url_decodee]);
const groupes = {};
for (const p of horsMenu) (groupes[p.categorie] ||= []).push(p);

const ok = pages.filter((p) => p.statut_http === 200);
const erreurs = Object.entries(state.done).filter(([, d]) => d.statut !== 200);
const imgs = Object.values(manifest).filter((m) => m.fichier);
const petites = imgs.filter((m) => m.largeur && m.largeur < 600);

const ligne = (p, indent = "") =>
  `${indent}- **${md(p.title.replace(/^.*? - /, "") || p.h1 || p.url_decodee)}** — \`${p.url_decodee}\` (${imgCount(p)} images)${p.source ? " · ⚠ page morte (500), texte récupéré sur la Wayback Machine" : ""}\n${indent}  ${md(resume(p))}`;

let inv = `# Inventaire de l'ancien site 2komi.com\n\nCrawl du ${new Date().toISOString().slice(0, 10)}, une page toutes les 2 à 3 s, en suivant tous les liens internes (le site n'a pas de sitemap.xml : https://www.2komi.com/sitemap.xml renvoie une erreur 500).\n\n`;
inv += `| | |\n|---|---|\n| URLs internes visitées | ${Object.keys(state.done).length} |\n| Pages HTML récupérées (200) | ${ok.length} |\n| URLs en erreur 500 sur le site actuel | ${erreurs.length} (pages mortes mais encore liées ; texte récupéré sur la Wayback Machine) |\n| Pages dans le menu | ${Object.keys(menu).length} |\n| Pages hors menu (villes, sous-pages…) | ${horsMenu.length} |\n| Images uniques téléchargées | ${imgs.length} (dont ${imgs.filter((m) => m.original).length} en taille d'origine) |\n| Images de moins de 600 px de large | ${petites.length} (voir images-a-remplacer.md) |\n| Liens externes distincts | ${Object.keys(state.external).length} |\n\n`;
inv += `Fichiers : \`pages/*.json\` (une fiche par page), \`html/\` (HTML brut), \`images/<catégorie>/\`, \`contenu-complet.md\`, \`seo.csv\`, \`redirections.csv\`, \`images-a-remplacer.md\`, \`liens-externes.md\`, \`avis-livre-d-or.json\`.\n\n`;
inv += `## 1. Arborescence du menu (ordre du site)\n\n`;
const writeNode = (n, indent) => {
  const p = byKey.get(n.key);
  const sous = n.enfants.length ? ` · ${n.enfants.length} sous-pages` : "";
  inv += p ? ligne(p, indent).replace(" images)", " images)" + sous) + "\n" : `${indent}- **${md(n.libelle)}** — \`${n.key}\` (non récupérée)\n`;
  for (const c of n.enfants) writeNode(c, indent + "  ");
};
for (const n of menuTree) writeNode(n, "");
inv += `\n## 2. Pages hors menu, par catégorie\n\n`;
for (const [cat, list] of Object.entries(groupes).sort((a, b) => b[1].length - a[1].length)) {
  inv += `### ${cat} (${list.length})\n\n`;
  for (const p of list.sort((a, b) => a.url_decodee.localeCompare(b.url_decodee, "he"))) inv += ligne(p) + "\n";
  inv += "\n";
}
if (erreurs.length) {
  inv += `## 3. URLs en erreur ou en redirection\n\n| URL | Statut | Détail |\n|---|---|---|\n`;
  for (const [k, d] of erreurs) inv += `| \`${k}\` | ${d.statut} | ${md(d.redirection || d.erreur || "")} |\n`;
  inv += "\n";
}
inv += `## 4. Images par catégorie\n\n| Catégorie | Images | < 600 px |\n|---|---|---|\n`;
const parCat = {};
for (const m of imgs) { parCat[m.categorie] ||= [0, 0]; parCat[m.categorie][0]++; if (m.largeur < 600) parCat[m.categorie][1]++; }
for (const [c, [n, s]] of Object.entries(parCat).sort((a, b) => b[1][0] - a[1][0])) inv += `| ${c} | ${n} | ${s} |\n`;
inv += `\n## 5. Éléments communs à toutes les pages (menu latéral, pied de page)\n\nCes lignes sont retirées de contenu-complet.md pour ne pas les répéter ${pages.length} fois :\n\n`;
for (const t of commun) inv += `- ${md(t.length > 140 ? t.slice(0, 137) + "…" : t)}\n`;
fs.writeFileSync(path.join(ROOT, "INVENTAIRE.md"), inv);

// ---- contenu complet ----
let cc = `# Contenu complet de 2komi.com, page par page (texte d'origine)\n\nLes éléments communs (menu latéral, pied de page) sont listés une seule fois dans INVENTAIRE.md, section 5.\n\n`;
const ordre = [...menuTree.flatMap(flat), ...horsMenu.map((p) => p.url_decodee)];
for (const k of [...new Set(ordre)]) {
  const p = byKey.get(k);
  if (!p) continue;
  cc += `\n---\n\n## ${p.title}\n\n- URL : \`${p.url_decodee}\`\n- Meta description : ${p.meta_description || "(aucune)"}\n- H1 : ${p.h1 || "(aucun)"}\n\n`;
  for (const b of propre(p)) {
    if (/^h[1-6]$/.test(b.type)) cc += `\n${"#".repeat(Math.min(6, +b.type[1] + 2))} ${b.text}\n\n`;
    else if (b.type === "li") cc += `- ${b.text}\n`;
    else if (b.type === "img") {
      const m = manifest[b.src.replace(/\/sop-resize-\d+-/, "/").replace(/\?.*$/, "")];
      cc += `[image${b.alt ? ` « ${b.alt} »` : ""}${m?.fichier ? ` → images/${m.fichier}` : ""}]\n\n`;
    } else cc += `${b.text}\n\n`;
  }
  if (p.videos.length) cc += `Vidéos : ${p.videos.filter((v) => !/likebox|showForm/.test(v.src)).map((v) => v.src).join(" · ") || "aucune"}\n\n`;
}
fs.writeFileSync(path.join(ROOT, "contenu-complet.md"), cc);

// ---- seo.csv / redirections.csv ----
let seo = "url_decodee,url_encodee,categorie,parent_menu,title,meta_description,meta_keywords,h1\n";
for (const p of pages) seo += [p.url_decodee, p.url_encodee, p.categorie, p.menu?.parent || (p.menu ? "(menu principal)" : ""), p.title, p.meta_description, p.meta_keywords, p.h1].map(csv).join(",") + "\n";
fs.writeFileSync(path.join(ROOT, "seo.csv"), "﻿" + seo);
const redirPath = path.join(ROOT, "redirections.csv");
if (!fs.existsSync(redirPath) || !fs.readFileSync(redirPath, "utf8").includes(",/")) {
  let r = "ancienne_url_decodee,ancienne_url_encodee,statut_actuel,categorie,nouvelle_url\n";
  for (const [k, d] of Object.entries(state.done)) r += [k, byKey.get(k)?.url_encodee || "", d.statut, categorieDe(k), ""].map(csv).join(",") + "\n";
  fs.writeFileSync(redirPath, "﻿" + r);
}

// ---- images à remplacer ----
let ir = `# Images à remplacer\n\nImages de moins de 600 px de large (la version d'origine a été demandée à chaque fois ; si elle n'existe plus, c'est la copie réduite qui a été gardée). À compléter à l'œil pour les images floues ou chargées de texte.\n\n| Fichier | Taille | Pages |\n|---|---|---|\n`;
for (const m of petites.sort((a, b) => a.largeur - b.largeur)) ir += `| images/${m.fichier} | ${m.largeur}×${m.hauteur} | ${m.pages.slice(0, 2).map((x) => "`" + x + "`").join(", ")}${m.pages.length > 2 ? "…" : ""} |\n`;
const introuvables = Object.entries(manifest).filter(([, m]) => m.erreur);
if (introuvables.length) { ir += `\n## Images introuvables (${introuvables.length})\n\n`; for (const [u] of introuvables) ir += `- ${decodeURI(u)}\n`; }
fs.writeFileSync(path.join(ROOT, "images-a-remplacer.md"), ir);

// ---- liens externes ----
let le = `# Liens externes trouvés\n\n| Lien | Nombre de pages |\n|---|---|\n`;
for (const [u, n] of Object.entries(state.external).sort((a, b) => b[1] - a[1])) le += `| ${u} | ${n} |\n`;
fs.writeFileSync(path.join(ROOT, "liens-externes.md"), le);

// ---- livre d'or (sans les emails des auteurs) ----
const avis = [];
for (const f of fs.readdirSync(path.join(ROOT, "html")).filter((f) => f.includes("guestbook"))) {
  const $ = cheerio.load(fs.readFileSync(path.join(ROOT, "html", f), "utf8"));
  $("td[valign=top]").each((_, td) => {
    const titre = $(td).children("font.changeText14").first().text().trim();
    const date = $(td).children("span.changeText14").first().text().replace(/[()]/g, "").trim();
    const div = $(td).children("div.changeText14").first();
    if (!titre || !date || !div.length) return;
    const texte = div.html().split(/<br\s*\/?>/i).map((s) => cheerio.load(s).text().trim()).filter(Boolean).join("\n");
    if (!avis.some((a) => a.titre === titre && a.date === date)) avis.push({ titre, date, texte, source: "ספר המלצות (livre d'or)" });
  });
}
fs.writeFileSync(path.join(ROOT, "avis-livre-d-or.json"), JSON.stringify(avis, null, 2));
console.log(`OK : ${pages.length} pages, ${imgs.length} images, ${avis.length} messages du livre d'or, ${commun.size} lignes communes`);

// ---- vidéos (YouTube / Facebook), dédoublonnées par identifiant ----
const vids = new Map();
for (const p of pages) for (const v of p.videos) {
  const id = /(?:embed\/|v\/|watch\?v=|youtu\.be\/)([\w-]{11})/.exec(v.src)?.[1];
  const k = id ? "yt:" + id : /facebook\.com\/(plugins\/video|.*\/videos\/)/.test(v.src) ? v.src.split("&")[0] : null;
  if (!k) continue;
  const e = vids.get(k) || { lien: id ? `https://www.youtube.com/watch?v=${id}` : v.src, pages: [] };
  if (!e.pages.includes(p.url_decodee)) e.pages.push(p.url_decodee);
  vids.set(k, e);
}
let vm = `# Vidéos de l'ancien site (${vids.size})\n\n| Vidéo | Pages |\n|---|---|\n`;
for (const v of vids.values()) vm += `| ${v.lien} | ${v.pages.slice(0, 3).map((x) => "`" + x + "`").join(", ")}${v.pages.length > 3 ? ` (+${v.pages.length - 3})` : ""} |\n`;
fs.writeFileSync(path.join(ROOT, "videos.md"), vm);
const cats = {}; for (const p of pages) cats[p.categorie] = (cats[p.categorie] || 0) + 1;
let invAll = fs.readFileSync(path.join(ROOT, "INVENTAIRE.md"), "utf8");
invAll = invAll.replace("| Liens externes distincts |", `| Vidéos YouTube/Facebook distinctes | ${vids.size} (voir videos.md) |\n| Messages du livre d'or | ${avis.length} (avis-livre-d-or.json, sans les emails) |\n| Pages par catégorie | ${Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c} ${n}`).join(" · ")} |\n| Liens externes distincts |`);
fs.writeFileSync(path.join(ROOT, "INVENTAIRE.md"), invAll);
console.log("vidéos :", vids.size);
