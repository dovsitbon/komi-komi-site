import Link from "next/link";
import home from "@/data/home.json";
import faq from "@/data/faq.json";
import realisations from "@/data/realisations.json";
import stats from "@/data/stats.json";
import { CtaBand, Faq, MoreLink, PrestationCard, ReviewCard, SectionTitle } from "@/components/blocks";
import { HeroStart } from "@/components/HeroStart";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { Confetti, StringLine, WhatsAppIcon } from "@/components/icons";
import { faqJsonLd } from "@/lib/jsonld";
import { avis, cities, featuredAvis, prestations, regions, themes, waLink } from "@/lib/site";
import he from "@/locales/he.json";

const FEATURED = ["dj", "clowns", "candy-bar", "food-stands", "photo-walls", "magnets", "game-tables", "graffiti-hats"];
const TILES = ["bar-mitzvah", "bat-mitzvah", "birthdays/boys", "birthdays/girls", "full-moon", "purim", "corporate", "brit"] as const;

export default function HomePage() {
  const h = he.home;
  const tiles = home.tiles as Record<string, string>;
  const featured = FEATURED.map((id) => prestations.find((p) => p.id === id)!).filter(Boolean);
  const proof = [
    stats.sinceYear ? { n: String(stats.sinceYear), label: h.proof.since } : null,
    stats.events ? { n: new Intl.NumberFormat("he-IL").format(stats.events), label: h.proof.events } : null,
    { n: String(avis.length), label: h.proof.reviews },
    { n: stats.ages, label: h.proof.ages },
    { n: String(cities.length), label: `ערים וישובים: ${h.proof.areas}` },
  ].filter((x): x is { n: string; label: string } => !!x);

  return (
    <>
      {/* Hero : texte + champs de devis d'un côté, la vraie photo de l'autre */}
      <section className="relative overflow-hidden">
        <Confetti className="pointer-events-none absolute -start-4 top-6 hidden h-28 w-28 opacity-80 lg:block" />
        <div className="wrap grid items-center gap-10 py-10 md:py-16 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div>
            <p className="eyebrow">{he.hero.eyebrow}</p>
            <h1 className="h-display mt-3 text-[2.5rem] md:text-[3.5rem] lg:text-[4rem]">{he.hero.title}</h1>
            <p className="lead mt-5 max-w-xl">{he.hero.text}</p>
            <div className="mt-8 max-w-xl">
              <HeroStart />
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="link mt-4 inline-flex min-h-11 items-center gap-2">
                <WhatsAppIcon className="text-[#128c7e]" />
                {he.common.whatsappAsk}
              </a>
            </div>
          </div>
          <div className="relative">
            <Photo id={home.hero} alt={he.meta.ogAlt} ratio="5 / 4" priority sizes="(min-width: 1024px) 620px, 92vw" />
            {stats.sinceYear && (
              <div className="absolute -bottom-5 start-4 flex h-28 w-28 -rotate-6 flex-col items-center justify-center rounded-full bg-sun text-center leading-tight md:-start-6 md:h-32 md:w-32" aria-hidden="true">
                <span className="text-[0.8125rem] font-medium">{he.hero.sticker}</span>
                <span className="font-[family-name:var(--font-display)] text-[1.75rem] font-extrabold tabular-nums">{stats.sinceYear}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tuiles par type d'événement */}
      <section aria-labelledby="tiles-title" className="wrap pt-8 pb-16 md:pb-24">
        <h2 id="tiles-title" className="h-display text-[1.75rem] md:text-[2.125rem]">
          {h.tilesTitle}
        </h2>
        <StringLine />
        <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {TILES.map((t, i) => (
            <Reveal as="li" key={t} delay={(i % 4) * 0.05}>
              <Link href={`/${t}`} className="group block">
                <Photo id={tiles[t]} alt={h.tiles[t]} ratio="1 / 1" sizes="(min-width: 768px) 290px, 46vw" />
                <span className="mt-3 flex items-center justify-between gap-2 font-[family-name:var(--font-display)] text-[1.0625rem] leading-snug font-bold transition-colors group-hover:text-violet md:text-[1.1875rem]">{h.tiles[t]}</span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Bande de preuves : uniquement des chiffres vérifiables (data/stats.json, livre d'or, villes) */}
      <section className="on-dark bg-violet text-white" aria-label={h.reviewsEyebrow}>
        <dl className="wrap grid grid-cols-2 gap-x-6 gap-y-8 py-12 md:grid-cols-4 md:py-14">
          {proof.slice(0, 4).map((s) => (
            <div key={s.label} className="flex flex-col-reverse">
              <dt className="mt-1 text-[0.9375rem] text-white/80">{s.label}</dt>
              <dd className="font-[family-name:var(--font-display)] text-[2.5rem] leading-none font-extrabold text-sun tabular-nums md:text-[3rem]">{s.n}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Catalogue : cartes avec ajout au devis */}
      <section aria-labelledby="catalog-title" className="wrap py-16 md:py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionTitle id="catalog-title" eyebrow={h.catalogEyebrow} title={h.catalogTitle} text={h.catalogText} />
          <MoreLink href="/catalog">{h.catalogAll}</MoreLink>
        </div>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal as="li" key={p.id} delay={(i % 4) * 0.05}>
              <PrestationCard p={p} />
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Thèmes d'anniversaire */}
      <section aria-labelledby="themes-title" className="bg-violet-soft">
        <div className="wrap py-16 md:py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionTitle id="themes-title" eyebrow={h.themesEyebrow} title={h.themesTitle} />
            <MoreLink href="/birthdays">{h.themesAll}</MoreLink>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2">
            {themes.map((t) => (
              <li key={t.slug}>
                <Link href={`/birthdays/${t.slug}`} className="chip">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Trois blocs alternés : une photo, un texte court, un seul bouton */}
      <div className="wrap space-y-16 py-16 md:space-y-24 md:py-24">
        {h.blocks.map((b, i) => (
          <section key={b.title} className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
            <Reveal className={i % 2 ? "md:order-2" : ""}>
              <Photo id={home.blocks[i]} alt={b.title} ratio="4 / 3" sizes="(min-width: 768px) 560px, 92vw" />
            </Reveal>
            <div>
              <p className="eyebrow mb-2">{b.eyebrow}</p>
              <h2 className="h-display text-[1.875rem] md:text-[2.5rem]">{b.title}</h2>
              <StringLine />
              <p className="lead mt-5 max-w-lg">{b.text}</p>
              <Link href={b.href} className={`btn mt-7 ${i === 0 ? "btn-primary" : "btn-ghost"}`}>
                {b.cta}
              </Link>
            </div>
          </section>
        ))}
      </div>

      {/* Full Moon : la seule section sombre du site */}
      <section className="on-dark bg-night text-white">
        <div className="wrap grid items-center gap-8 py-16 md:grid-cols-2 md:gap-16 md:py-24">
          <div>
            <p className="font-[family-name:var(--font-display)] text-[0.9375rem] font-medium text-neon-lime" dir="ltr">
              Full Moon
            </p>
            <h2 className="h-display mt-2 text-[1.875rem] md:text-[2.75rem]">
              מכבים את האור, <span className="text-neon-pink">והכל זוהר</span>
            </h2>
            <p className="lead mt-5 max-w-lg">תפאורה באולטרה סגול, אוהל איפור, עמדת DJ מתנפחת בצורת פרפר ובר מתוקים זוהר. לבר ובת מצווה, ליום הולדת ולמסיבות נוער.</p>
            <Link href="/full-moon" className="btn btn-ghost mt-7">
              למסיבות פול מון
            </Link>
          </div>
          <Photo id={tiles["full-moon"]} alt="תפאורה זוהרת של מסיבת פול מון" ratio="4 / 3" sizes="(min-width: 768px) 560px, 92vw" />
        </div>
      </section>

      {/* Réalisations */}
      <section aria-labelledby="works-title" className="wrap py-16 md:py-24">
        <SectionTitle id="works-title" eyebrow={h.worksEyebrow} title={h.worksTitle} text={h.worksText} />
        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {realisations.items.map((r, i) => (
            <Reveal as="li" key={r.image} delay={(i % 4) * 0.04}>
              <Link href={r.href} className="group relative block">
                <Photo id={r.image} alt={r.type} ratio="4 / 3" sizes="(min-width: 768px) 290px, 46vw" />
                <span className="absolute start-3 bottom-3 rounded-full bg-white px-3 py-1 text-[0.8125rem] font-medium">
                  {r.type}
                  {r.city ? ` · ${r.city}` : ""}
                  {r.kids ? ` · ${r.kids} ${h.kids}` : ""}
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Avis réels du livre d'or */}
      <section aria-labelledby="reviews-title" className="bg-violet-soft">
        <div className="wrap py-16 md:py-24">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionTitle id="reviews-title" eyebrow={h.reviewsEyebrow} title={h.reviewsTitle} text={h.reviewsSource} />
            <MoreLink href="/reviews">{he.common.allReviews}</MoreLink>
          </div>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {featuredAvis.slice(0, 3).map((a) => (
              <li key={a.id}>
                <ReviewCard a={a} clamp />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pages locales */}
      <section aria-labelledby="local-title" className="wrap py-16 md:py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionTitle id="local-title" eyebrow={h.localEyebrow} title={h.localTitle} />
          <MoreLink href="/clowns">{h.localAll}</MoreLink>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {regions.map((r) => (
            <div key={r.slug}>
              <h3 className="font-bold">
                <Link href={`/clowns/${r.slug}`} className="transition-colors hover:text-violet">
                  {r.h1}
                </Link>
              </h3>
              <ul className="mt-2 text-[0.9375rem]">
                {cities
                  .filter((c) => c.region === r.slug)
                  .slice(0, 8)
                  .map((c) => (
                    <li key={c.slug}>
                      <Link href={`/clowns/${c.slug}`} className="inline-flex min-h-9 items-center text-muted transition-colors hover:text-violet">
                        {c.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="wrap pb-16 md:pb-24">
        <SectionTitle id="faq-title" eyebrow={h.faqEyebrow} title={h.faqTitle} />
        <div className="mt-8">
          <Faq items={faq} />
        </div>
      </section>

      <CtaBand title={h.ctaTitle} text={h.ctaText} />
      <JsonLd data={faqJsonLd(faq)} />
    </>
  );
}
