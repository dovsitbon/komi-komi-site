// Vérifie que chaque ancienne URL de 2komi.com renvoie bien un 301 vers une page qui existe (200),
// puis écrit ancien-site/redirections.csv (ancienne URL → nouvelle URL → résultat du test).
//   node scripts/check-redirects.mjs [base]      base par défaut : http://localhost:3287
// Exemple en production : node scripts/check-redirects.mjs https://komi-komi.vercel.app
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const base = (process.argv[2] || "http://localhost:3287").replace(/\/$/, "");
const redirects = JSON.parse(fs.readFileSync(path.join(ROOT, "data/redirects.json"), "utf8"));
const state = JSON.parse(fs.readFileSync(path.join(ROOT, "ancien-site/_state.json"), "utf8"));

const encode = (key) => {
  const i = key.indexOf("?");
  return i < 0 ? encodeURI(key) : encodeURI(key.slice(0, i)) + "?" + encodeURI(key.slice(i + 1));
};
const csv = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const targets = new Map();
const rows = [];
let ok = 0;
const bad = [];
for (const [oldUrl, to] of Object.entries(redirects)) {
  const enc = encode(oldUrl);
  let status = 0, location = "", targetStatus = 0, result;
  if (oldUrl === "/") {
    // L'accueil garde la même adresse : pas de redirection, la page doit simplement répondre
    status = (await fetch(base + "/", { redirect: "manual" })).status;
    targetStatus = status;
    result = status === 200 ? "OK (même URL)" : "ERREUR";
  } else {
    const res = await fetch(base + enc, { redirect: "manual" });
    status = res.status;
    location = res.headers.get("location") || "";
    const locPath = location ? new URL(location, base).pathname : "";
    if (!targets.has(to)) targets.set(to, (await fetch(base + to, { redirect: "manual" })).status);
    targetStatus = targets.get(to);
    result = status === 301 && decodeURI(locPath) === to && targetStatus === 200 ? "OK" : "ERREUR";
  }
  if (result.startsWith("OK")) ok++;
  else bad.push(`${status} ${oldUrl} → ${location || "(rien)"} (attendu ${to}, cible ${targetStatus})`);
  rows.push([oldUrl, "https://www.2komi.com" + enc, state.done[oldUrl]?.statut ?? "", to, status, targetStatus, result]);
}

const head = "ancienne_url_decodee,ancienne_url_encodee,statut_sur_ancien_site,nouvelle_url,code_redirection,code_page_cible,test\n";
fs.writeFileSync(path.join(ROOT, "ancien-site/redirections.csv"), "﻿" + head + rows.map((r) => r.map(csv).join(",")).join("\n") + "\n");

// Une adresse inconnue de l'ancien site ne doit pas tomber en 404 non plus
const extra = ["/106214/" + encodeURI("עמוד-שלא-קיים"), "/site/detail/guestbook/guestbook.asp?depart_id=106214&iPageNum=99", "/site/form/showForm.asp?depart_id=106214&form_id=588138"];
for (const e of extra) {
  const res = await fetch(base + e, { redirect: "manual" });
  if (res.status !== 301) bad.push(`${res.status} ${e} (filet de sécurité)`);
  else ok++;
}

console.log(`${ok}/${rows.length + extra.length} redirections correctes sur ${base}`);
if (bad.length) {
  console.log(bad.join("\n"));
  process.exit(1);
}
