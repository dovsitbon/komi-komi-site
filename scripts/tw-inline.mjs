// Contournement local : quand Windows bloque les binaires natifs, le scanner de Tailwind (repli WASI) ne lit plus
// les fichiers et aucune classe utilitaire n'est générée. Ce script liste les classes candidates des composants
// dans app/tw-inline.css (@source inline), importé par globals.css. Sans effet sur Vercel (le scanner y fonctionne).
//   node scripts/tw-inline.mjs
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const files = [];
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx|ts)$/.test(f)) files.push(p);
  }
};
["app", "components", "lib"].forEach((d) => walk(path.join(ROOT, d)));

const tokens = new Set();
for (const f of files) {
  for (const t of readFileSync(f, "utf8").split(/[\s"'`{}]+/)) {
    // Forme d'une classe : préfixes (md:, rtl:, group-open:…), nom, valeur arbitraire éventuelle entre crochets.
    // Pas de virgule ni de parenthèse hors crochets : elles cassent l'analyse de @source inline.
    if (/^!?([a-z0-9-]+(\[[^\]\s,]*\])?:)*!?-?[a-z][a-z0-9\-/.%]*(\[[^\]\s,]+\])?(\/[0-9]+)?!?$/i.test(t) && t.length < 90) tokens.add(t);
  }
}
const list = [...tokens].sort().join(" ");
writeFileSync(path.join(ROOT, "app/tw-inline.css"), `/* Généré par scripts/tw-inline.mjs – ne pas modifier à la main */\n@source inline("${list}");\n`);
console.log(`${tokens.size} classes candidates`);
