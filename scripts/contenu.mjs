// Génère CONTENU.md : tous les nouveaux textes du site, à faire valider par le client.
//   node scripts/contenu.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"));
const he = read("locales/he.json");
const pages = read("data/pages.json");
const faq = read("data/faq.json");
const prestations = read("data/prestations.json");
const redirects = read("data/redirects.json");
const annonce = read("data/annonces.json");

const oldOf = {};
for (const [old, to] of Object.entries(redirects)) (oldOf[to] ||= []).push(old);
const NL = "\n";
let md = `# Textes du nouveau site Komi Komi (à valider)${NL}${NL}`;
md += `Tous les textes ci-dessous ont été réécrits à partir de l'ancien site 2komi.com (texte d'origine complet : \`ancien-site/contenu-complet.md\`). Aucun chiffre, prix ou avis n'a été inventé : les prix viennent de l'ancienne page « מגנטים לאירועים », les avis du livre d'or.${NL}${NL}`;
md += `Pour corriger un texte : les pages sont écrites dans \`scripts/content/*.mjs\`, l'interface dans \`locales/he.json\`, la FAQ dans \`data/faq.json\`. Après modification : \`npm run data\`.${NL}${NL}`;

md += `## Titre du hero : 3 propositions${NL}${NL}`;
md += `1. **${he.hero.title}** (en place)${NL}2. מסיבה שהילדים זוכרים, הפקה שההורים נהנים ממנה${NL}3. אתם בוחרים נושא, אנחנו מביאים את המסיבה${NL}${NL}`;
md += `- Petite ligne : ${he.hero.eyebrow}${NL}- Texte : ${he.hero.text}${NL}- Bandeau d'annonce (data/annonces.json) : ${annonce.text}${NL}${NL}`;

md += `## Accueil${NL}${NL}`;
md += `- Balise title : ${he.meta.title}${NL}- Meta description : ${he.meta.description}${NL}${NL}`;
for (const b of he.home.blocks) md += `### ${b.title}${NL}${NL}${b.eyebrow} — ${b.text} *(bouton : ${b.cta})*${NL}${NL}`;
md += `### Titres de section${NL}${NL}`;
for (const k of ["tilesTitle", "catalogTitle", "catalogText", "themesTitle", "worksTitle", "worksText", "localTitle", "reviewsTitle", "faqTitle", "ctaTitle", "ctaText"]) md += `- ${he.home[k]}${NL}`;

md += `${NL}## Catalogue des prestations (${prestations.items.length})${NL}${NL}| Prestation | Catégorie | Texte de la carte | Prix « à partir de » |${NL}|---|---|---|---|${NL}`;
for (const p of prestations.items) md += `| ${p.name} | ${p.catLabel} | ${p.short} | ${p.priceFrom ? p.priceFrom + " ₪ (ancien site)" : "à demander"} |${NL}`;

md += `${NL}## FAQ commune${NL}${NL}`;
for (const f of faq) md += `**${f.q}**${NL}${NL}${f.a}${NL}${NL}`;

const groups = [
  ["Événements", (p) => p.kind === "event"],
  ["Sous-pages (DJ, Pourim, bars à bonbons…)", (p) => p.kind === "sub"],
  ["Anniversaires à thème", (p) => p.kind === "theme"],
  ["Anniversaires par zone", (p) => p.kind === "area"],
  ["Catalogue : pages de détail", (p) => p.kind === "catalog-item"],
  ["Clowns : régions, âges, sujets", (p) => ["clown-region", "clown-age", "clown-topic"].includes(p.kind)],
  ["Clowns : une page par ville", (p) => p.kind === "clown-city"],
];
for (const [title, test] of groups) {
  const list = pages.filter(test);
  md += `${NL}## ${title} (${list.length} pages)${NL}`;
  for (const p of list) {
    md += `${NL}### ${p.h1}${NL}${NL}- Nouvelle URL : \`${p.path}\`${NL}- Anciennes URLs redirigées : ${(oldOf[p.path] || []).map((o) => "`" + o + "`").join(", ") || "(nouvelle page)"}${NL}- Balise title : ${p.title}${NL}- Meta description : ${p.description}${NL}${NL}`;
    md += p.intro.join(NL + NL) + NL;
    if (p.highlights.length && p.kind !== "clown-city") md += NL + p.highlights.map((h) => `- ${h}`).join(NL) + NL;
    if (p.faq.length) md += NL + p.faq.map((f) => `**${f.q}** ${f.a}`).join(NL + NL) + NL;
  }
}
fs.writeFileSync(path.join(ROOT, "CONTENU.md"), md);
console.log("CONTENU.md :", md.length, "caractères,", pages.length, "pages");
