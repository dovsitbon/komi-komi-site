"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon } from "@/components/icons";
import he from "@/locales/he.json";

type Annonce = { active: boolean; id: string; text: string; link?: string; linkLabel?: string; until?: string };

/** Bandeau d'infos pratiques (data/annonces.json), que le visiteur peut fermer ; le choix est gardé pour cette annonce. */
export function AnnounceBar({ annonce }: { annonce: Annonce }) {
  const key = `komi-annonce-${annonce.id}`;
  const [show, setShow] = useState(true);

  useEffect(() => {
    try {
      const expired = annonce.until ? new Date(annonce.until + "T23:59:59") < new Date() : false;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture du choix du visiteur après l'hydratation
      if (expired || localStorage.getItem(key) === "1") setShow(false);
    } catch {}
  }, [annonce.until, key]);

  if (!annonce.active || !show) return null;
  return (
    <div className="on-dark bg-violet text-white" role="region" aria-label="הודעה">
      <div className="wrap flex min-h-11 items-center justify-between gap-3 py-1 text-[0.9375rem]">
        <p className="py-1">
          {annonce.text}
          {annonce.link && (
            <>
              {" "}
              <Link href={annonce.link} className="link whitespace-nowrap">
                {annonce.linkLabel || he.common.more}
              </Link>
            </>
          )}
        </p>
        <button
          type="button"
          aria-label={he.common.announceClose}
          onClick={() => {
            try {
              localStorage.setItem(key, "1");
            } catch {}
            setShow(false);
          }}
          className="-me-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/15"
        >
          <CloseIcon width={18} height={18} />
        </button>
      </div>
    </div>
  );
}
