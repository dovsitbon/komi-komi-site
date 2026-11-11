import type { NextConfig } from "next";
import oldUrls from "./data/redirects.json";

/**
 * Redirections 301 de l'ancien site 2komi.com (LiveCity) : chaque ancienne URL pointe vers la page équivalente.
 * La liste complète est dans data/redirects.json (générée par scripts/build-data.mjs, reprise dans ancien-site/redirections.csv).
 * - Les chemins en hébreu sont comparés sous leur forme encodée (%D7…), celle qu'envoient les navigateurs et Google.
 * - Les URLs à paramètres (/site/…asp?depart_id=…) sont redirigées sur leur chemin, quels que soient les paramètres.
 */
const escapeSource = (s: string) => s.replace(/[()[\]{}:*+?]/g, (c) => "\\" + c);

function oldSiteRedirects() {
  const byPath = new Map<string, string>();
  for (const [oldUrl, to] of Object.entries(oldUrls as Record<string, string>)) {
    if (oldUrl === "/") continue;
    const path = oldUrl.split("?")[0];
    // Pour une même page .asp à paramètres, la première cible l'emporte (livre d'or → avis, fiches → clowns)
    if (!byPath.has(path)) byPath.set(path, to);
  }
  const list = [...byPath].map(([path, destination]) => ({ source: escapeSource(encodeURI(path)), destination, statusCode: 301 as const }));
  return [
    ...list,
    // Filets de sécurité : toute autre ancienne adresse LiveCity retombe sur une page utile, jamais sur une 404
    { source: "/site/form/:path*", destination: "/contact", statusCode: 301 as const },
    { source: "/site/detail/guestbook/:path*", destination: "/reviews", statusCode: 301 as const },
    { source: "/site/:path*", destination: "/", statusCode: 301 as const },
    { source: "/106214/:path*", destination: "/", statusCode: 301 as const },
    { source: "/image/users/:path*", destination: "/", statusCode: 301 as const },
  ];
}

const nextConfig: NextConfig = {
  // CSS inliné dans le HTML : supprime la requête bloquante avant le premier rendu
  experimental: { inlineCss: true },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 80],
    deviceSizes: [480, 640, 828, 1080, 1280, 1600],
    minimumCacheTTL: 2678400,
  },
  async redirects() {
    return oldSiteRedirects();
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
