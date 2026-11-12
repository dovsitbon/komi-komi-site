"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type Slide = { src: string; w: number; h: number; alt: string };

/**
 * Photos d'une catégorie qui défilent en fondu dans un cadre (bannières de l'accueil).
 * Seule la première photo est chargée d'emblée ; les suivantes le sont au fil du défilement.
 * Sans animation si le visiteur a demandé moins de mouvement : la première photo reste affichée.
 */
export function Slideshow({ slides, alt, ratio, sizes, priority, delay = 0, className = "" }: { slides: Slide[]; alt: string; ratio: string; sizes: string; priority?: boolean; delay?: number; className?: string }) {
  const [i, setI] = useState(0);
  const [seen, setSeen] = useState(1);

  useEffect(() => {
    if (slides.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        setI((n) => (n + 1) % slides.length);
        setSeen((n) => Math.min(slides.length, n + 1));
      }, 3600);
    }, delay);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, [slides.length, delay]);

  return (
    <div className={`photo ${className}`} style={{ aspectRatio: ratio }}>
      {slides.slice(0, Math.min(slides.length, seen + 1)).map((s, n) => (
        <Image
          key={s.src}
          src={s.src}
          alt={n === 0 ? s.alt || alt : ""}
          aria-hidden={n === 0 ? undefined : true}
          width={s.w}
          height={s.h}
          sizes={sizes}
          priority={priority && n === 0}
          quality={85}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${n === i ? "opacity-100" : "opacity-0"}`}
        />
      ))}
    </div>
  );
}
