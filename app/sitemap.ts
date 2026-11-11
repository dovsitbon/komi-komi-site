import type { MetadataRoute } from "next";
import { pages, site } from "@/lib/site";

/** Toutes les pages indexables : accueil, pages de contenu (dont une par ville et par thème), catalogue, avis, contact, devis. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const fixed = [
    { path: "", priority: 1 },
    { path: "/catalog", priority: 0.8 },
    { path: "/reviews", priority: 0.7 },
    { path: "/quote", priority: 0.7 },
    { path: "/contact", priority: 0.6 },
  ];
  const prio: Record<string, number> = { event: 0.9, theme: 0.7, sub: 0.7, area: 0.6, "catalog-item": 0.6, "clown-region": 0.6, "clown-city": 0.5, "clown-age": 0.5, "clown-topic": 0.5 };
  return [
    ...fixed.map((f) => ({ url: site.url + f.path, lastModified: now, changeFrequency: "monthly" as const, priority: f.priority })),
    ...pages.map((p) => ({ url: site.url + p.path, lastModified: now, changeFrequency: "monthly" as const, priority: prio[p.kind] ?? 0.5 })),
  ];
}
