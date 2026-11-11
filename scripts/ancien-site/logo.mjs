// Redessine en vectoriel le logo du site d'origine (lettres manuscrites « קומי קומי » + « הפקות » + taches de couleur),
// à partir du bandeau de 2komi.com (seule source : 1200×100 px). Les lettres sont tracées (potrace) sur un
// agrandissement ×12 ; les quatre taches sont reconstruites aux positions et couleurs mesurées.
//   node scripts/ancien-site/logo.mjs   →   public/logo.svg
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const potrace = require("potrace");
const sharp = createRequire(path.resolve(import.meta.dirname, "../../package.json"))("sharp");

const ROOT = path.resolve(import.meta.dirname, "../..");
const SRC = path.join(ROOT, "ancien-site/images/pourim/pourim-001-באנר-עליון-קומי-קומי.jpg");
const CROP = { left: 868, top: 0, width: 332, height: 100 }; // zone du logo dans le bandeau
const K = 12;

// 1. Masque des lettres : noir = max(r,g,b) faible (les taches colorées ont toujours un canal clair)
const { data, info } = await sharp(SRC).extract(CROP).resize({ width: CROP.width * K, kernel: "lanczos3" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const mask = Buffer.alloc(info.width * info.height);
for (let i = 0, j = 0; i < data.length; i += 3, j++) mask[j] = Math.max(data[i], data[i + 1], data[i + 2]) < 120 ? 0 : 255;
const png = await sharp(mask, { raw: { width: info.width, height: info.height, channels: 1 } }).blur(5).png().toBuffer();

// 2. Tracé vectoriel
const svgTrace = await new Promise((res, rej) => potrace.trace(png, { threshold: 128, turdSize: 120, optTolerance: 1.2, alphaMax: 1.3 }, (e, svg) => (e ? rej(e) : res(svg))));
const d = /<path d="([^"]+)"/.exec(svgTrace)[1];

// 3. Taches de couleur (coordonnées du recadrage ×K) : orange, rose, vert anis, turquoise, et leurs recouvrements
const s = (v) => Math.round(v * K);
const X = (x) => s(x - (CROP.left - 820)); // mesures prises sur un recadrage commençant à 820
const blob = (x0, y0, x1, y1) => ({ x: X(x0), y: s(y0), w: s(x1 - x0), h: s(y1 - y0), r: s(Math.min(x1 - x0, y1 - y0) * 0.34) });
const B = { orange: blob(290, 4, 306, 20), pink: blob(310, 7, 371, 68), lime: blob(270, 27, 316, 74), cyan: blob(296, 39, 352, 96) };
const rect = (b, fill, extra = "") => `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.r}" fill="${fill}"${extra}/>`;
const W = info.width, H = info.height;
const blobs = `<defs><clipPath id="kc"><rect x="${B.cyan.x}" y="${B.cyan.y}" width="${B.cyan.w}" height="${B.cyan.h}" rx="${B.cyan.r}"/></clipPath></defs>${rect(B.orange, "#ffc24d")}${rect(B.cyan, "#4dfdf3")}${rect(B.lime, "#ceff4c")}${rect(B.pink, "#ff4ca3")}<g clip-path="url(#kc)">${rect(B.lime, "#a7ff49")}${rect(B.pink, "#d64d9f")}</g>`;

// Cadrage serré : on retire la marge vide à gauche (les lettres commencent vers x = 57 − 48)
const vbX = s(4), vbW = W - vbX;
const svg = (ink) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} 0 ${vbW} ${H}" role="img" aria-label="קומי קומי הפקות">${blobs}<path d="${d}" fill="${ink}" fill-rule="evenodd"/></svg>\n`;
fs.writeFileSync(path.join(ROOT, "public/logo.svg"), svg("#16141b"));
console.log(`logo : ${vbW}×${H}, tracé ${d.length} caractères`);
