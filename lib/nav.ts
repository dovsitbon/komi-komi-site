import { pages, themes, regions } from "@/lib/site";

export type NavLink = { href: string; label: string };
export type NavGroup = { label: string; href: string; columns?: { title?: string; links: NavLink[] }[] };

const label = (path: string, fallback?: string) => fallback || pages.find((p) => p.path === path)?.nav || path;
const l = (path: string, text?: string): NavLink => ({ href: path, label: label(path, text) });

const purimSubs = pages.filter((p) => p.parent === "/purim");
const candySubs = pages.filter((p) => p.parent === "/candy-bar");
const boys = themes.filter((t) => t.gender !== "girls");
const girls = themes.filter((t) => t.gender !== "boys");

/** Menu principal (méga-menu sur ordinateur, accordéon sur mobile). */
export const NAV: NavGroup[] = [
  {
    label: "בר / בת מצווה",
    href: "/bar-mitzvah",
    columns: [
      { title: "בר מצווה", links: [l("/bar-mitzvah", "הפקת בר מצווה"), l("/bar-mitzvah/dj", "תקליטן לבר מצווה"), l("/candy-bar/bar-mitzvah", "בר מתוקים לבר מצווה")] },
      { title: "בת מצווה", links: [l("/bat-mitzvah", "הפקת בת מצווה"), l("/bat-mitzvah/dj", "תקליטן והפעלות"), l("/full-moon/bat-mitzvah", "בת מצווה פול מון")] },
      { title: "אטרקציות", links: [l("/catalog/photo-walls", "קירות צילום"), l("/catalog/magnets", "צלם ומגנטים"), l("/catalog/game-tables", "שולחנות משחק"), l("/catalog/graffiti-hats", "גרפיטי על כובעים"), l("/catalog/caricature-shirts", "קריקטורה על חולצות")] },
    ],
  },
  {
    label: "ימי הולדת",
    href: "/birthdays",
    columns: [
      { title: "לפי נושא", links: [l("/birthdays", "כל הנושאים"), l("/birthdays/boys", "ימי הולדת לבנים"), l("/birthdays/girls", "ימי הולדת לבנות"), l("/birthdays/dj", "תקליטן ליום הולדת"), l("/birthdays/tips", "טיפים להורים")] },
      { title: "לבנים", links: boys.slice(0, 8).map((t) => l(`/birthdays/${t.slug}`, t.name)) },
      { title: "לבנות", links: girls.filter((t) => t.gender === "girls").slice(0, 8).map((t) => l(`/birthdays/${t.slug}`, t.name)) },
      { title: "לפי אזור", links: [l("/birthdays/haifa", "חיפה"), l("/birthdays/krayot", "הקריות"), l("/birthdays/north", "הצפון"), l("/birthdays/herzliya", "הרצליה והשרון")] },
    ],
  },
  {
    label: "בר מתוקים ודוכנים",
    href: "/candy-bar",
    columns: [
      { title: "בר מתוקים", links: [l("/candy-bar", "בר מתוקים לאירועים"), ...candySubs.map((p) => l(p.path, p.nav))] },
      { title: "דוכנים ומשחקים", links: [l("/catalog/food-stands", "דוכני מזון"), l("/catalog/fair-stands", "דוכני יריד"), l("/catalog/fruit-kayak", "קיאק פירות"), l("/catalog/active-bar", "בר אקטיבי לילדים"), l("/catalog", "כל הקטלוג")] },
    ],
  },
  {
    label: "פול מון",
    href: "/full-moon",
    columns: [{ links: [l("/full-moon", "מסיבות פול מון"), l("/full-moon/bat-mitzvah", "בת מצווה פול מון"), l("/birthdays/glow-party", "יום הולדת זוהר")] }],
  },
  {
    label: "ליצנים ו-DJ",
    href: "/clowns",
    columns: [
      { title: "ליצנים", links: [l("/clowns", "ליצנים ליום הולדת"), l("/clowns/ages", "לפי גילאים"), l("/clowns/events", "ליצנים לאירועים"), l("/clowns/purim", "ליצנים לפורים")] },
      { title: "לפי אזור", links: regions.map((r) => l(`/clowns/${r.slug}`, r.h1)) },
      { title: "תקליטנים ומפעילים", links: [l("/birthdays/dj", "תקליטן ליום הולדת"), l("/bar-mitzvah/dj", "תקליטן לבר מצווה"), l("/bat-mitzvah/dj", "תקליטן לבת מצווה"), l("/catalog/hosts", "מנחים ומפעילים"), l("/catalog/magician", "מופע קסמים"), l("/catalog/karaoke", "קריוקי")] },
    ],
  },
  {
    label: "פורים",
    href: "/purim",
    columns: [{ links: [l("/purim", "תחנות הפעלה לפורים"), ...purimSubs.map((p) => l(p.path, p.nav))] }],
  },
  { label: "אירועים עסקיים", href: "/corporate" },
  { label: "המלצות", href: "/reviews" },
  { label: "צור קשר", href: "/contact" },
];
