import Link from "next/link";
import home from "@/data/home.json";
import faq from "@/data/faq.json";
import realisations from "@/data/realisations.json";
import stats from "@/data/stats.json";
import { CtaBand, Faq, MoreLink, PrestationCard, ReviewCard, SectionTitle } from "@/components/blocks";
import { CategoryPortal } from "@/components/CategoryPortal";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { CheckIcon, StringLine } from "@/components/icons";
import { faqJsonLd } from "@/lib/jsonld";
import { avis, cities, featuredAvis, prestations, regions, themes } from "@/lib/site";
import he from "@/locales/he.json";

const FEATURED = ["dj", "clowns", "candy-bar", "food-stands", "photo-walls", "magnets", "game-tables", "graffiti-hats"];

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
      <CategoryPortal />

      {/* Présentation, reprise de l'accueil d'origine : qui nous sommes, pourquoi fêter avec nous */}
      <section aria-labelledby="about-title" className="bg-violet-soft">
        <div className="wrap grid gap-10 py-16 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <SectionTitle id="about-title" eyebrow={h.about.eyebrow} title={h.about.title} />
            <div className="prose-he mt-6 max-w-xl text-[1.0625rem] leading-[1.8]">
              {h.about.p.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
            <Link href="/quote" className="btn btn-primary mt-8">
              {he.common.quote}
            </Link>
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-[1.375rem] font-bold">{h.about.whyTitle}</h3>
            <ul className="mt-5 space-y-3">
              {h.about.why.map((w) => (
                <li key={w.t} className="card flex gap-4 p-5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet text-white">
                    <CheckIcon width={15} height={15} />
                  </span>
                  <span>
                    <span className="block font-[family-name:var(--font-display)] text-[1.0625rem] font-bold">{w.t}</span>
                    <span className="mt-1 block text-[0.9375rem] leading-relaxed text-muted">{w.d}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 font-medium">{h.about.closing}</p>
          </div>
        </div>
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

      {/* Bar et bat-mitsva : texte de l'accueil d'origine + les options citées */}
      <section aria-labelledby="mitzvah-title" className="wrap grid items-center gap-10 py-16 md:py-24 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <Photo id={home.mitzvah} alt={h.mitzvah.eyebrow} ratio="4 / 3" sizes="(min-width: 1024px) 580px, 92vw" />
        </Reveal>
        <div>
          <SectionTitle id="mitzvah-title" eyebrow={h.mitzvah.eyebrow} title={h.mitzvah.title} />
          <div className="prose-he mt-6 max-w-xl text-muted">
            {h.mitzvah.p.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
          <ul className="mt-6 flex flex-wrap gap-2">
            {h.mitzvah.tags.map((t) => (
              <li key={t} className="tag">
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/bar-mitzvah" className="btn btn-ghost">
              {h.mitzvah.bar}
            </Link>
            <Link href="/bat-mitzvah" className="btn btn-ghost">
              {h.mitzvah.bat}
            </Link>
          </div>
        </div>
      </section>

      {/* DJ : texte de l'accueil d'origine */}
      <section aria-labelledby="dj-title" className="wrap grid items-center gap-10 pb-16 md:pb-24 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionTitle id="dj-title" eyebrow={h.dj.eyebrow} title={h.dj.title} />
          <div className="prose-he mt-6 max-w-xl text-muted">
            {h.dj.p.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/bat-mitzvah/dj" className="btn btn-ghost">
              {h.dj.bat}
            </Link>
            <Link href="/bar-mitzvah/dj" className="btn btn-ghost">
              {h.dj.bar}
            </Link>
            <Link href="/birthdays/dj" className="btn btn-ghost">
              {h.dj.kids}
            </Link>
          </div>
        </div>
        <Reveal>
          <Photo id={home.dj} alt={h.dj.title} ratio="4 / 3" sizes="(min-width: 1024px) 580px, 92vw" />
        </Reveal>
      </section>

      {/* Anniversaires : garçons, filles, puis tous les thèmes */}
      <section aria-labelledby="themes-title" className="bg-violet-soft">
        <div className="wrap py-16 md:py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionTitle id="themes-title" eyebrow={h.themesEyebrow} title={h.themesTitle} text={h.birthdays.text} />
            <MoreLink href="/birthdays">{h.themesAll}</MoreLink>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {(
              [
                ["/birthdays/boys", h.birthdays.boysTitle, h.birthdays.boys, h.birthdays.boysCta, tiles["birthdays/boys"]],
                ["/birthdays/girls", h.birthdays.girlsTitle, h.birthdays.girls, h.birthdays.girlsCta, tiles["birthdays/girls"]],
              ] as const
            ).map(([href, title, text, cta, img]) => (
              <article key={href} className="card flex flex-col overflow-hidden">
                <Photo id={img} alt={title} ratio="16 / 9" sizes="(min-width: 768px) 580px, 92vw" className="rounded-none" />
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-[1.25rem] font-bold">{title}</h3>
                  <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted">{text}</p>
                  <MoreLink href={href}>{cta}</MoreLink>
                </div>
              </article>
            ))}
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

      {/* Blocs alternés : une photo, un texte court, un seul bouton */}
      <div className="wrap space-y-16 pb-16 md:space-y-24 md:pb-24">
        {h.blocks.map((b, i) => (
          <section key={b.title} className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
            <Reveal className={i % 2 ? "md:order-2" : ""}>
              <Photo id={home.blocks[i]} alt={b.title} ratio="4 / 3" sizes="(min-width: 768px) 580px, 92vw" />
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
          <Photo id={tiles["full-moon"]} alt="תפאורה זוהרת של מסיבת פול מון" ratio="4 / 3" sizes="(min-width: 768px) 580px, 92vw" />
        </div>
      </section>

      {/* Comment ça marche */}
      <section aria-labelledby="steps-title" className="wrap py-16 md:py-24">
        <SectionTitle id="steps-title" eyebrow={h.steps.eyebrow} title={h.steps.title} />
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {h.steps.items.map((s, i) => (
            <li key={s.t} className="card p-6">
              <span className="font-[family-name:var(--font-display)] text-[2rem] leading-none font-extrabold text-pink-ink tabular-nums">{i + 1}</span>
              <h3 className="mt-3 text-[1.1875rem] font-bold">{s.t}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Réalisations */}
      <section aria-labelledby="works-title" className="wrap pb-16 md:pb-24">
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
