"use client";

import { useState } from "react";
import { PlayIcon } from "@/components/icons";
import he from "@/locales/he.json";

/** Vidéo YouTube chargée seulement au clic (vignette légère d'abord) : aucune lecture ni son automatique. */
export function YouTubeLite({ id, title }: { id: string; title: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="photo aspect-video">
      {on ? (
        <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full border-0" />
      ) : (
        <button type="button" onClick={() => setOn(true)} aria-label={`${he.common.playVideo}: ${title}`} className="group absolute inset-0 h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element -- vignette servie par YouTube */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" width={480} height={360} className="h-full w-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-ink/20 transition-colors group-hover:bg-ink/35">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-violet">
              <PlayIcon />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
