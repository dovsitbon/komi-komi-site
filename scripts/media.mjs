// Convertit en WebP les photos retenues (data/media-src.json) depuis ancien-site/images vers public/media/<id>.webp
// et écrit data/media.json (src, dimensions, alt). Ne retouche pas les fichiers déjà convertis.
//   node scripts/media.mjs [--force]
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "ancien-site/images");
const OUT = path.join(ROOT, "public/media");
fs.mkdirSync(OUT, { recursive: true });
const src = JSON.parse(fs.readFileSync(path.join(ROOT, "data/media-src.json"), "utf8"));
const force = process.argv.includes("--force");
const MAX = 1600;

const media = {};
let done = 0;
for (const [id, m] of Object.entries(src)) {
  const out = path.join(OUT, id + ".webp");
  if (force || !fs.existsSync(out)) {
    await sharp(path.join(SRC, m.file), { failOn: "none" }).rotate().resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(out);
    done++;
  }
  const meta = await sharp(out).metadata();
  media[id] = { src: `/media/${id}.webp`, w: meta.width, h: meta.height, alt: m.alt || "" };
}
// supprime les fichiers qui ne sont plus utilisés
for (const f of fs.readdirSync(OUT)) if (f.endsWith(".webp") && !media[f.replace(".webp", "")]) fs.unlinkSync(path.join(OUT, f));
fs.writeFileSync(path.join(ROOT, "data/media.json"), JSON.stringify(media, null, 1) + "\n");
const total = fs.readdirSync(OUT).reduce((a, f) => a + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`${Object.keys(media).length} images (${done} converties), ${(total / 1e6).toFixed(1)} Mo dans public/media`);
