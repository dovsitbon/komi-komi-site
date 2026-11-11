/**
 * Logo de Komi Komi, le même que sur le site d'origine : « קומי קומי » manuscrit, « הפקות » et quatre taches de couleur.
 * Redessiné en vectoriel d'après le bandeau de 2komi.com (scripts/ancien-site/logo.mjs → public/logo.svg).
 * Sur fond sombre (`onDark`), il est posé sur une pastille blanche, comme dans le bandeau d'origine.
 */
export function Logo({ onDark = false }: { onDark?: boolean }) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- SVG vectoriel servi tel quel, mis en cache par le navigateur
    <img src="/logo.svg" alt="קומי קומי הפקות" width={184} height={56} decoding="async" className={onDark ? "h-14 w-auto" : "h-11 w-auto md:h-14"} />
  );
  return onDark ? <span className="inline-flex items-center rounded-2xl bg-white px-4 py-2">{img}</span> : img;
}
