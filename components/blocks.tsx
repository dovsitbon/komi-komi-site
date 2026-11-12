import Link from "next/link";
import type { ReactNode } from "react";
import { AddToQuote } from "@/components/Cart";
import { Photo } from "@/components/Photo";
import { ArrowIcon, StringLine, WhatsAppIcon } from "@/components/icons";
import { shekels, site, waLink, type Avis, type Prestation } from "@/lib/site";
import he from "@/locales/he.json";

/** Titre de section : petite ligne, titre, ficelle de ballon. */
export function SectionTitle({ eyebrow, title, text, id, center = false }: { eyebrow?: string; title: string; text?: string; id?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h2 id={id} className="h-display text-[2rem] md:text-[2.875rem]">
        {title}
      </h2>
      <StringLine className={`string ${center ? "mx-auto" : ""}`} />
      {text && <p className="lead mt-5">{text}</p>}
    </div>
  );
}

/** Carte du catalogue : photo, texte court, prix « à partir de » s'il existe, bouton d'ajout au devis. */
export function PrestationCard({ p }: { p: Prestation }) {
  return (
    <article className="card flex h-full flex-col overflow-hidden">
      {p.image ? (
        <Link href={p.page} tabIndex={-1} aria-hidden="true" className="block">
          <Photo id={p.image} alt={p.name} ratio="4 / 3" sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 92vw" className="rounded-none" />
        </Link>
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-violet-soft px-6 text-center font-[family-name:var(--font-display)] text-[1.375rem] font-bold text-violet" aria-hidden="true">
          {p.name}
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.875rem] text-muted">{p.catLabel}</p>
        <h3 className="mt-1 text-[1.1875rem] leading-snug font-bold">
          <Link href={p.page} className="transition-colors hover:text-violet">
            {p.name}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted">{p.short}</p>
        {site.showPrices && p.priceFrom ? (
          <p className="mt-3 font-[family-name:var(--font-display)] font-medium tabular-nums">
            {he.common.from}
            {shekels(p.priceFrom)}
          </p>
        ) : null}
        <AddToQuote id={p.id} name={p.name} className="mt-4 self-start" />
      </div>
    </article>
  );
}

/** Avis d'un parent, repris tel quel du livre d'or. */
export function ReviewCard({ a, clamp = false }: { a: Avis; clamp?: boolean }) {
  return (
    <figure className="card flex h-full flex-col p-6">
      <blockquote className={`flex-1 text-[1rem] leading-relaxed ${clamp ? "line-clamp-[9]" : ""}`}>{a.text}</blockquote>
      <figcaption className="mt-4 flex items-center gap-3 text-[0.875rem] text-muted">
        <span className="tag">{a.tag}</span>
        <span className="tabular-nums">{a.year}</span>
      </figcaption>
    </figure>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f) => (
        <details key={f.q} className="group">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-3 font-[family-name:var(--font-display)] text-[1.125rem] font-medium">
            {f.q}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-soft text-violet transition-transform duration-200 group-open:rotate-45" aria-hidden="true">
              +
            </span>
          </summary>
          <p className="max-w-3xl pb-6 text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Bandeau final : une phrase, le bouton de devis et WhatsApp. */
export function CtaBand({ title, text, href = "/quote" }: { title: string; text: string; href?: string }) {
  return (
    <section className="bg-sun-soft">
      <div className="wrap flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between md:py-16">
        <div className="max-w-xl">
          <h2 className="h-display text-[1.75rem] md:text-[2.125rem]">{title}</h2>
          <p className="mt-2 text-muted">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={href} className="btn btn-primary">
            {he.common.quote}
          </Link>
          <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            <WhatsAppIcon className="text-[#128c7e]" />
            {he.common.whatsappAsk}
          </a>
        </div>
      </div>
    </section>
  );
}

export function MoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="link inline-flex min-h-11 items-center gap-2">
      {children}
      <ArrowIcon />
    </Link>
  );
}
