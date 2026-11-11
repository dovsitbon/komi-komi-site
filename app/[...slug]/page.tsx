import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import commonFaq from "@/data/faq.json";
import { CtaBand, Faq, PrestationCard, ReviewCard, SectionTitle } from "@/components/blocks";
import { AddToQuote } from "@/components/Cart";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { ThemeGrid, type ThemeItem } from "@/components/ThemeGrid";
import { YouTubeLite } from "@/components/YouTubeLite";
import { CheckIcon, StringLine, WhatsAppIcon } from "@/components/icons";
import { pageJsonLd } from "@/lib/jsonld";
import { quoteHref } from "@/lib/quote";
import { breadcrumbs, childrenOf, cities, getAvis, getMedia, getPage, getPrestation, pages, quoteTypeFor, regions, shekels, site, themes, waLink, type Page } from "@/lib/site";
import he from "@/locales/he.json";

type Props = { params: Promise<{ slug: string[] }> };
const pathOf = (slug: string[]) => "/" + slug.map((s) => decodeURIComponent(s)).join("/");

export const dynamicParams = false;
export function generateStaticParams() {
  return pages.map((p) => ({ slug: p.path.slice(1).split("/") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getPage(pathOf((await params).slug));
  if (!page) return {};
  const img = getMedia(page.images[0]);
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      type: "website",
      url: page.path,
      siteName: site.nameHe,
      title: page.title,
      description: page.description,
      locale: "he_IL",
      images: img ? [{ url: img.src, width: img.w, height: img.h, alt: img.alt || page.h1 }] : [{ url: "/og.jpg", width: 1200, height: 630, alt: he.meta.ogAlt }],
    },
  };
}

const themeItems = (list = themes): ThemeItem[] => list.map((t) => ({ ...t, img: getMedia(t.image) || null }));

/** Liens vers les sous-pages : thèmes, villes, régions, âges, déclinaisons. */
function Children({ page }: { page: Page }) {
  const p = he.page;
  const seg = page.path.split("/").pop()!;
  const linkList = (items: { href: string; label: string }[]) => (
    <ul className="mt-8 flex flex-wrap gap-2">
      {items.map((i) => (
        <li key={i.href}>
          <Link href={i.href} className="chip">
            {i.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  if (page.path === "/birthdays" || page.meta.gender === "boys" || page.meta.gender === "girls") {
    if (page.kind === "theme") return null;
    const fixed = page.path === "/birthdays" ? undefined : (page.meta.gender as "boys" | "girls");
    return (
      <section aria-labelledby="themes-title" className="wrap py-14 md:py-20">
        <SectionTitle id="themes-title" title={p.themes} />
        <div className="mt-8">
          <ThemeGrid items={themeItems(fixed ? themes.filter((t) => t.gender === "both" || t.gender === fixed) : themes)} fixedGender={fixed} />
        </div>
        {page.path === "/birthdays" && (
          <>
            <h3 className="mt-12 font-[family-name:var(--font-display)] text-[1.375rem] font-bold">ימי הולדת לפי אזור ועוד</h3>
            {linkList(
              childrenOf("/birthdays")
                .filter((k) => k.kind === "area" || k.kind === "sub")
                .map((k) => ({ href: k.path, label: k.h1 })),
            )}
          </>
        )}
      </section>
    );
  }
  if (page.path === "/clowns") {
    return (
      <section aria-labelledby="regions-title" className="wrap py-14 md:py-20">
        <SectionTitle id="regions-title" title={p.regions} />
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {regions.map((r) => (
            <div key={r.slug}>
              <h3 className="font-bold">
                <Link href={`/clowns/${r.slug}`} className="link">
                  {r.h1}
                </Link>
              </h3>
              <ul className="mt-2 text-[0.9375rem]">
                {cities
                  .filter((c) => c.region === r.slug)
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
        <h3 className="mt-12 font-[family-name:var(--font-display)] text-[1.375rem] font-bold">{p.byAge}</h3>
        {linkList(childrenOf("/clowns/ages").map((a) => ({ href: a.path, label: a.nav })))}
        <h3 className="mt-12 font-[family-name:var(--font-display)] text-[1.375rem] font-bold">{he.page.related}</h3>
        {linkList(
          childrenOf("/clowns")
            .filter((k) => k.kind === "clown-topic")
            .map((k) => ({ href: k.path, label: k.h1 })),
        )}
      </section>
    );
  }
  if (page.kind === "clown-region") {
    return (
      <section aria-labelledby="cities-title" className="wrap py-14 md:py-20">
        <SectionTitle id="cities-title" title={p.cities} />
        {linkList(cities.filter((c) => c.region === seg).map((c) => ({ href: `/clowns/${c.slug}`, label: `ליצנים ${c.in}` })))}
      </section>
    );
  }
  if (page.kind === "clown-city") {
    const c = cities.find((x) => x.slug === seg);
    const near = (c?.near || []).map((s) => cities.find((x) => x.slug === s)).filter((x): x is (typeof cities)[number] => !!x);
    return (
      <section aria-labelledby="near-title" className="wrap py-14 md:py-20">
        <SectionTitle id="near-title" title={p.citiesNear} />
        {linkList([...near.map((n) => ({ href: `/clowns/${n.slug}`, label: `ליצנים ${n.in}` })), ...(page.parent ? [{ href: page.parent, label: getPage(page.parent)?.h1 || "" }] : []), { href: "/clowns/ages", label: he.page.byAge }])}
      </section>
    );
  }
  const kids = childrenOf(page.path);
  if (!kids.length) return null;
  return (
    <section aria-labelledby="sub-title" className="wrap py-14 md:py-20">
      <SectionTitle id="sub-title" title={page.path === "/clowns/ages" ? p.byAge : `עוד על ${page.nav}`} />
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {kids.map((k) => (
          <li key={k.path}>
            <Link href={k.path} className="card group flex h-full flex-col p-6 transition-colors hover:border-violet">
              <h3 className="text-[1.1875rem] font-bold transition-colors group-hover:text-violet">{k.h1}</h3>
              <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-relaxed text-muted">{k.intro[0]}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function ContentPage({ params }: Props) {
  const page = getPage(pathOf((await params).slug));
  if (!page) notFound();
  const p = he.page;
  const trail = breadcrumbs(page);
  const type = quoteTypeFor(page.path);
  const main = page.meta.prestation ? getPrestation(page.meta.prestation) : undefined;
  const quote = quoteHref({ type, add: main?.id, theme: page.meta.theme });
  const [hero, second, ...gallery] = page.images;
  const addons = page.prestations.filter((id) => id !== main?.id).map((id) => getPrestation(id)).filter((x): x is NonNullable<typeof x> => !!x);
  const reviews = getAvis(page.reviews);
  const faq = [...page.faq, ...(page.kind === "event" || page.kind === "theme" ? commonFaq.slice(0, 4) : commonFaq.slice(0, 2))];
  const dark = page.dark;

  return (
    <>
      {/* En-tête de page */}
      <section className={dark ? "on-dark bg-night text-white" : ""}>
        <div className="wrap pt-6 pb-12 md:pb-16">
          <nav aria-label={he.common.breadcrumb} className={`text-[0.875rem] ${dark ? "text-white/70" : "text-muted"}`}>
            <ol className="flex flex-wrap items-center gap-x-2">
              <li>
                <Link href="/" className="inline-flex min-h-9 items-center hover:underline">
                  {he.common.home}
                </Link>
              </li>
              {trail.map((t, i) => (
                <li key={t.path} className="flex items-center gap-x-2">
                  <span aria-hidden="true">/</span>
                  {i === trail.length - 1 ? (
                    <span aria-current="page" className={dark ? "text-white" : "text-ink"}>
                      {t.label}
                    </span>
                  ) : (
                    <Link href={t.path} className="inline-flex min-h-9 items-center hover:underline">
                      {t.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className={`mt-6 grid items-center gap-10 ${hero ? "lg:grid-cols-[1fr_1fr] lg:gap-14" : ""}`}>
            <div className="max-w-2xl">
              {page.eyebrow && <p className={`eyebrow ${dark ? "!text-neon-lime" : ""}`}>{page.eyebrow}</p>}
              <h1 className="h-display mt-2 text-[2.25rem] md:text-[3.25rem]">{page.h1}</h1>
              <StringLine className={`string ${dark ? "text-neon-pink" : ""}`} />
              <div className="prose-he lead mt-6">
                {page.intro.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
              {site.showPrices && main?.priceFrom ? (
                <p className="mt-5 font-[family-name:var(--font-display)] text-[1.25rem] font-bold tabular-nums">
                  {he.common.from}
                  {shekels(main.priceFrom)}
                </p>
              ) : null}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={quote} className="btn btn-primary">
                  {he.common.quote}
                </Link>
                {main ? (
                  <AddToQuote id={main.id} name={main.name} className="!min-h-12 !px-6 !text-base" />
                ) : (
                  <a href={waLink(`שלום, אשמח לפרטים על ${page.h1}`)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                    <WhatsAppIcon className={dark ? "" : "text-[#128c7e]"} />
                    {he.common.whatsappAsk}
                  </a>
                )}
              </div>
            </div>
            {hero && <Photo id={hero} alt={page.h1} ratio="4 / 3" priority sizes="(min-width: 1024px) 600px, 92vw" />}
          </div>
        </div>
      </section>

      {/* Ce qui est inclus */}
      {page.highlights.length > 0 && (
        <section aria-labelledby="included-title" className="bg-violet-soft">
          <div className={`wrap grid items-start gap-10 py-14 md:py-20 ${second ? "lg:grid-cols-[1.1fr_0.9fr] lg:gap-14" : ""}`}>
            <div>
              <SectionTitle id="included-title" title={p.included} />
              <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {page.highlights.map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet text-white">
                      <CheckIcon width={14} height={14} />
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            {second && (
              <Reveal>
                <Photo id={second} alt={`${page.h1} – ${p.included}`} ratio="4 / 3" sizes="(min-width: 1024px) 500px, 92vw" />
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* Déroulé type d'un anniversaire */}
      {page.program && (
        <section aria-labelledby="program-title" className="wrap py-14 md:py-20">
          <SectionTitle id="program-title" title={p.program} />
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {page.program.map((t, i) => (
              <li key={t} className="card p-5">
                <span className="font-[family-name:var(--font-display)] text-[1.5rem] font-extrabold text-pink-ink tabular-nums">{i + 1}</span>
                <p className="mt-1 leading-snug">{t}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <Children page={page} />

      {/* Options citées sur l'ancienne page */}
      {page.tags.length > 0 && (
        <section aria-labelledby="tags-title" className="wrap pb-14 md:pb-20">
          <h2 id="tags-title" className="font-[family-name:var(--font-display)] text-[1.375rem] font-bold">
            {p.tags}
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {page.tags.map((t) => (
              <li key={t} className="tag">
                {t}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Galerie */}
      {gallery.length > 0 && !page.inheritedImages && (
        <section aria-labelledby="gallery-title" className="wrap pb-14 md:pb-20">
          <SectionTitle id="gallery-title" title={p.gallery} />
          <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {gallery.map((id, i) => (
              <Reveal as="li" key={id} delay={(i % 4) * 0.04}>
                <Photo id={id} alt={`${page.h1} – ${i + 3}`} ratio="1 / 1" sizes="(min-width: 768px) 290px, 46vw" />
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* Vidéos de l'ancien site (chargées au clic) */}
      {page.videos.length > 0 && (
        <section aria-labelledby="videos-title" className="wrap pb-14 md:pb-20">
          <SectionTitle id="videos-title" title={p.videos} />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {page.videos.map((v, i) => (
              <YouTubeLite key={v} id={v} title={`${page.h1} – ${p.videos} ${i + 1}`} />
            ))}
          </div>
        </section>
      )}

      {/* Prestations à ajouter au devis */}
      {addons.length > 0 && (
        <section aria-labelledby="addons-title" className="bg-violet-soft">
          <div className="wrap py-14 md:py-20">
            <SectionTitle id="addons-title" title={p.addons} />
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {addons.slice(0, 8).map((a) => (
                <li key={a.id}>
                  <PrestationCard p={a} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Avis du livre d'or qui citent cette ville, ce thème ou ce type d'événement */}
      {reviews.length > 0 && (
        <section aria-labelledby="reviews-title" className="wrap py-14 md:py-20">
          <SectionTitle id="reviews-title" title={p.reviews} text={he.home.reviewsSource} />
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {reviews.map((a) => (
              <li key={a.id}>
                <ReviewCard a={a} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="faq-title" className="wrap pb-14 md:pb-20">
        <SectionTitle id="faq-title" title={p.faq} />
        <div className="mt-8">
          <Faq items={faq} />
        </div>
      </section>

      {page.related.length > 0 && (
        <nav aria-labelledby="related-title" className="wrap pb-14 md:pb-20">
          <h2 id="related-title" className="font-[family-name:var(--font-display)] text-[1.375rem] font-bold">
            {p.related}
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {page.related
              .map((r) => getPage(r))
              .filter((x): x is Page => !!x)
              .map((r) => (
                <li key={r.path}>
                  <Link href={r.path} className="chip">
                    {r.h1}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      )}

      <CtaBand title={p.ctaTitle} text={p.ctaText} href={quote} />
      <JsonLd data={pageJsonLd(page, faq)} />
    </>
  );
}
