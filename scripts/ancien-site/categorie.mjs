// Catégorie d'une page à partir de son URL décodée (sert aux images et à l'inventaire)
export const CATEGORIES = [
  ["guestbook", /guestbook/i, "livre-d-or"],
  ["form", /showForm|צרו-קשר/i, "contact"],
  ["avis", /ממליצים|המלצות/i, "avis"],
  ["full-moon", /פול-?מון|full-?moo?n|פולמון/i, "full-moon"],
  ["bar-matokim", /מתוק/i, "bar-matokim"],
  ["clowns", /ליצנ|ליצן/i, "clowns"],
  ["pourim", /פורים/i, "pourim"],
  ["dj", /תקליטן|DJ|די-ג/i, "dj"],
  ["bat-mitsva", /בת-מצווה/i, "bat-mitsva"],
  ["bar-mitsva", /בר-מצווה/i, "bar-mitsva"],
  ["stands", /דוכני|דוכן|יריד/i, "stands"],
  ["magnets", /מגנט/i, "magnets"],
  ["jeux", /שולחנות-משחק|משחק/i, "tables-de-jeux"],
  ["casquettes", /כובע/i, "casquettes-graffiti"],
  ["tshirts", /חולצ/i, "tshirts-caricature"],
  ["murs-photo", /קירות-צילום|קיר-צילום/i, "murs-photo"],
  ["entreprise", /עסקי/i, "entreprise"],
  ["anniversaires", /יומולדת|יום-הולדת|ימי-הולדת|ליום-הולדת/i, "anniversaires"],
  ["kayak", /קיאק|פירות/i, "kayak-fruits"],
];
export function categorieDe(key) {
  if (key === "/" || /index\.asp/i.test(key)) return "accueil";
  for (const [, re, slug] of CATEGORIES) if (re.test(key)) return slug;
  return "divers";
}
