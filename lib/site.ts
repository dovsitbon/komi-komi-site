import site from "@/data/site.json";
import pagesData from "@/data/pages.json";
import mediaData from "@/data/media.json";
import prestationsData from "@/data/prestations.json";
import themesData from "@/data/themes.json";
import villesData from "@/data/villes.json";
import avisData from "@/data/avis.json";

export { site };

export type Page = {
  path: string;
  kind: string;
  parent: string | null;
  nav: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string[];
  highlights: string[];
  program: string[] | null;
  tags: string[];
  oldText: { type: "p" | "h" | "li"; text: string }[];
  reviews: number[];
  images: string[];
  videos: string[];
  prestations: string[];
  related: string[];
  faq: { q: string; a: string }[];
  dark: boolean;
  inheritedImages?: boolean;
  meta: { gender?: string; ages?: number[]; theme?: string; city?: string; region?: string; age?: number; prestation?: string; priceFrom?: number | null };
};
export type Media = { src: string; w: number; h: number; alt: string };
export type Prestation = { id: string; cat: string; catLabel: string; name: string; short: string; page: string; priceFrom?: number; image: string | null };
export type Theme = { slug: string; name: string; gender: "boys" | "girls" | "both"; ages: number[]; text: string; image: string | null };
export type Avis = { id: number; year: number; tag: string; text: string };

export const pages = pagesData as unknown as Page[];
const byPath = new Map(pages.map((p) => [p.path, p]));
export const getPage = (path: string) => byPath.get(path);
export const childrenOf = (path: string) => pages.filter((p) => p.parent === path);

export const media = mediaData as Record<string, Media>;
export const getMedia = (id: string | null | undefined) => (id ? media[id] : undefined);

export const prestations = prestationsData.items as Prestation[];
export const prestationCats = prestationsData.cats as Record<string, string>;
export const getPrestation = (id: string) => prestations.find((p) => p.id === id);

export const themes = themesData as Theme[];
export const regions = villesData.regions;
export const cities = villesData.cities;

export const avis = avisData.items as Avis[];
const avisById = new Map(avis.map((a) => [a.id, a]));
export const getAvis = (ids: number[]) => ids.map((i) => avisById.get(i)).filter((a): a is Avis => !!a);
export const featuredAvis = getAvis(avisData.featured);

export const waLink = (text?: string) => `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
export const telHref = (i = 0) => `tel:${site.phones[i].intl}`;
export const shekels = (n: number) => `${new Intl.NumberFormat("he-IL").format(n)} ₪`;

/** Fil d'Ariane : de l'accueil jusqu'à la page. */
export function breadcrumbs(page: Page) {
  const trail: { path: string; label: string }[] = [];
  let cur: Page | undefined = page;
  while (cur) {
    trail.unshift({ path: cur.path, label: cur.nav });
    cur = cur.parent ? byPath.get(cur.parent) : undefined;
  }
  if (page.path.startsWith("/catalog/")) trail.unshift({ path: "/catalog", label: "קטלוג" });
  return trail;
}

/** Type d'événement pré-sélectionné dans le formulaire selon la page. */
export function quoteTypeFor(path: string): string {
  if (path.startsWith("/bar-mitzvah")) return "bar-mitzvah";
  if (path.startsWith("/bat-mitzvah") || path === "/full-moon/bat-mitzvah") return "bat-mitzvah";
  if (path.startsWith("/full-moon")) return "full-moon";
  if (path.startsWith("/purim")) return "purim";
  if (path.startsWith("/corporate")) return "corporate";
  if (path.startsWith("/brit")) return "brit";
  if (path.startsWith("/birthdays") || path.startsWith("/clowns")) return "birthday";
  return "";
}

/**
 * Photos d'arrière-plan de l'en-tête d'une page : grandes photos horizontales de la page, complétées par celles
 * de sa catégorie (pages parentes) pour qu'il y en ait toujours plusieurs, toutes du même sujet.
 */
export function backgroundSlides(page: Page, max = 6): Media[] {
  const fits = (min: number) => (m: Media | undefined): m is Media => !!m && m.w >= min && m.w / m.h >= 1.25 && m.w / m.h <= 1.9;
  const chain: Page[] = [];
  for (let cur: Page | undefined = page; cur; cur = cur.parent ? byPath.get(cur.parent) : undefined) chain.push(cur);
  const hub = byPath.get("/" + page.path.split("/")[1]);
  if (hub && !chain.includes(hub)) chain.push(hub);
  const ids = [...new Set(chain.flatMap((p) => (p.inheritedImages && p !== page ? [] : p.images)))];
  const all = ids.map((id) => media[id]);
  const big = all.filter(fits(1200));
  return (big.length >= 2 ? big : [...big, ...all.filter(fits(900)).filter((m) => !big.includes(m))]).slice(0, max);
}
