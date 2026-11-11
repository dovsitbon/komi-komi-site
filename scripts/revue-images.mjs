// Planches de revue : une ligne par page, avec les photos retenues (pour écarter à l'œil les affiches et gros plans).
// Chaque vignette porte sa référence de planche « catégorie:numéro », à copier dans scripts/content/exclude.json.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const pages = JSON.parse(fs.readFileSync(path.join(ROOT, "data/pages.json"), "utf8"));
const src = JSON.parse(fs.readFileSync(path.join(ROOT, "data/media-src.json"), "utf8"));
const planches = JSON.parse(fs.readFileSync(path.join(ROOT, "ancien-site/_planches/index.json"), "utf8"));
const refOf = {};
for (const [cat, list] of Object.entries(planches)) list.forEach((f, i) => { if (f) refOf[f] = `${cat.replace("anniversaires", "an").replace("bar-matokim", "bm").replace("full-moon", "fm").replace("pourim", "po").replace("accueil", "ac")}:${i}`; });
const rows = pages.filter((p) => p.images.length && !p.inheritedImages);
const T = 170, COLS = 10, PER = 12;
const OUT = path.join(ROOT, "ancien-site/_planches/revue");
fs.mkdirSync(OUT, { recursive: true });
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
for (let s = 0; s < rows.length; s += PER) {
  const part = rows.slice(s, s + PER);
  const comps = [];
  for (const [r, p] of part.entries()) {
    comps.push({ input: Buffer.from(`<svg width="${COLS * T}" height="22"><rect width="100%" height="100%" fill="#222"/><text x="6" y="16" font-size="14" font-family="Arial" fill="#fff">${esc(p.path)}</text></svg>`), left: 0, top: r * (T + 22) });
    for (const [i, id] of p.images.slice(0, COLS).entries()) {
      const m = src[id];
      const img = await sharp(path.join(ROOT, "ancien-site/images", m.file), { failOn: "none" }).rotate().resize(T, T, { fit: "cover" }).jpeg().toBuffer();
      const label = Buffer.from(`<svg width="${T}" height="${T}"><rect width="64" height="20" fill="#000"/><text x="3" y="15" font-size="13" font-family="Arial" fill="#ff0">${refOf[m.file] || "?"}</text></svg>`);
      comps.push({ input: await sharp(img).composite([{ input: label }]).toBuffer(), left: i * T, top: r * (T + 22) + 22 });
    }
  }
  await sharp({ create: { width: COLS * T, height: part.length * (T + 22), channels: 3, background: "#eee" } }).composite(comps).jpeg({ quality: 70 }).toFile(path.join(OUT, `revue-${s / PER}.jpg`));
}
console.log(rows.length, "pages,", Math.ceil(rows.length / PER), "planches");
