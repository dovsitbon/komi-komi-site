// Planches contact des images de l'ancien site (pour choisir les photos à l'œil) : ancien-site/_planches/<cat>-<n>.jpg
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
const ROOT = path.resolve(import.meta.dirname, "../ancien-site");
const man = JSON.parse(fs.readFileSync(path.join(ROOT, "images/_manifest.json"), "utf8"));
const byCat = {};
for (const m of Object.values(man)) if (m.fichier && m.largeur >= 500) (byCat[m.categorie] ||= []).push(m);
const T = 230, COLS = 6, PER = 36;
const index = {};
for (const [cat, list] of Object.entries(byCat)) {
  list.sort((a, b) => a.fichier.localeCompare(b.fichier));
  for (let s = 0; s < list.length; s += PER) {
    const part = list.slice(s, s + PER);
    const rows = Math.ceil(part.length / COLS);
    const tiles = await Promise.all(part.map(async (m, i) => {
      const n = s + i;
      (index[cat] ||= [])[n] = m.fichier;
      const img = await sharp(path.join(ROOT, "images", m.fichier)).rotate().resize(T, T, { fit: "cover" }).jpeg().toBuffer().catch(() => null);
      const label = Buffer.from(`<svg width="${T}" height="${T}"><rect x="0" y="0" width="58" height="26" fill="#000"/><text x="6" y="19" font-size="18" font-family="Arial" fill="#fff">${n}</text><text x="${T - 6}" y="${T - 6}" font-size="13" text-anchor="end" font-family="Arial" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">${m.largeur}</text></svg>`);
      return { input: img ? await sharp(img).composite([{ input: label }]).toBuffer() : label, left: (i % COLS) * T, top: Math.floor(i / COLS) * T };
    }));
    await sharp({ create: { width: COLS * T, height: rows * T, channels: 3, background: "#ddd" } }).composite(tiles).jpeg({ quality: 72 }).toFile(path.join(ROOT, "_planches", `${cat}-${s / PER}.jpg`));
  }
}
fs.writeFileSync(path.join(ROOT, "_planches/index.json"), JSON.stringify(index, null, 1));
console.log(Object.fromEntries(Object.entries(byCat).map(([c, l]) => [c, l.length])));
