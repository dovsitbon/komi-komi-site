"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EVENT_TYPES, KIDS_RANGES, quoteHref } from "@/lib/quote";
import he from "@/locales/he.json";

/** Champs du hero : « quel événement ? » + « combien d'enfants ? » lancent directement la demande de devis. */
export function HeroStart() {
  const router = useRouter();
  const [type, setType] = useState("");
  const [kids, setKids] = useState("");
  const h = he.hero;

  return (
    <form
      className="card grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(quoteHref({ type, kids }));
      }}
    >
      <div>
        <label htmlFor="hero-type" className="label">
          {h.typeLabel}
        </label>
        <select id="hero-type" className="field" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">{h.typePlaceholder}</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {he.quote.types[t]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="hero-kids" className="label">
          {h.kidsLabel}
        </label>
        <select id="hero-kids" className="field" value={kids} onChange={(e) => setKids(e.target.value)}>
          <option value="">{h.kidsPlaceholder}</option>
          {KIDS_RANGES.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary">
        {he.common.quote}
      </button>
    </form>
  );
}
