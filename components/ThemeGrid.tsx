"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import he from "@/locales/he.json";

export type ThemeItem = { slug: string; name: string; gender: "boys" | "girls" | "both"; ages: number[]; text: string; img: { src: string; w: number; h: number; alt: string } | null };
const AGES = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** Thèmes d'anniversaire filtrables : garçons / filles / âge. `fixedGender` verrouille le filtre (pages garçons et filles). */
export function ThemeGrid({ items, fixedGender }: { items: ThemeItem[]; fixedGender?: "boys" | "girls" }) {
  const [gender, setGender] = useState<"all" | "boys" | "girls">(fixedGender || "all");
  const [age, setAge] = useState(0);
  const p = he.page;
  const list = items.filter((t) => (gender === "all" || t.gender === "both" || t.gender === gender) && (!age || (age >= t.ages[0] && age <= t.ages[1])));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {!fixedGender &&
          (["all", "boys", "girls"] as const).map((g) => (
            <button key={g} type="button" className="chip" aria-pressed={gender === g} onClick={() => setGender(g)}>
              {g === "all" ? p.filterAll : g === "boys" ? p.filterBoys : p.filterGirls}
            </button>
          ))}
        <label className="ms-auto flex items-center gap-2 text-[0.9375rem]">
          {p.filterAge}
          <select className="field w-auto min-w-36" value={age} onChange={(e) => setAge(+e.target.value)}>
            <option value={0}>{p.filterAnyAge}</option>
            {AGES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="sr-only" role="status">
        {list.length}
      </p>
      {list.length ? (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <li key={t.slug}>
              <Link href={`/birthdays/${t.slug}`} className="card group flex h-full flex-col overflow-hidden transition-colors hover:border-violet">
                {t.img ? (
                  <div className="aspect-[4/3] overflow-hidden bg-violet-soft">
                    <Image src={t.img.src} alt={t.img.alt || `יום הולדת ${t.name}`} width={t.img.w} height={t.img.h} sizes="(min-width: 1024px) 380px, (min-width: 640px) 46vw, 92vw" quality={85} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-violet-soft px-6 text-center font-[family-name:var(--font-display)] text-[1.5rem] font-bold text-violet" aria-hidden="true">
                    {t.name}
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-[1.1875rem] font-bold transition-colors group-hover:text-violet">יום הולדת {t.name}</h3>
                  <p className="mt-1 text-[0.875rem] text-muted tabular-nums">
                    {t.gender === "boys" ? p.filterBoys : t.gender === "girls" ? p.filterGirls : `${p.filterBoys} ו${p.filterGirls}`} · {p.ages} {t.ages[0]}–{t.ages[1]}
                  </p>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{t.text}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-muted">{p.noThemes}</p>
      )}
    </div>
  );
}
