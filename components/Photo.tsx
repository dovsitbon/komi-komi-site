import Image from "next/image";
import { getMedia } from "@/lib/site";

/**
 * Photo réelle de l'ancien site (data/media.json). `alt` de secours obligatoire : toutes les images ont un texte en hébreu.
 * `ratio` recadre dans un cadre aux coins arrondis ; sans ratio, l'image garde ses proportions.
 */
export function Photo({ id, alt, ratio, sizes, priority, className = "" }: { id: string | null | undefined; alt: string; ratio?: string; sizes: string; priority?: boolean; className?: string }) {
  const m = getMedia(id);
  if (!m) return null;
  return (
    <div className={`photo ${className}`} style={ratio ? { aspectRatio: ratio } : { aspectRatio: `${m.w} / ${m.h}` }}>
      <Image src={m.src} alt={m.alt || alt} width={m.w} height={m.h} sizes={sizes} priority={priority} quality={priority ? 90 : 85} />
    </div>
  );
}
