import type { Metadata } from "next";
import Link from "next/link";
import home from "@/data/home.json";
import { CtaBand, ReviewCard } from "@/components/blocks";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { CheckIcon, PhoneIcon, StringLine, WhatsAppIcon } from "@/components/icons";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { avis, featuredAvis, site, waLink } from "@/lib/site";
import he from "@/locales/he.json";

/**
 * Page « à propos ». L'ancien site n'avait pas de page dédiée : les textes sont ceux de son accueil
 * (bloc « אודות קומי קומי הפקות » et bloc de présentation de la société), repris tels quels depuis locales/he.json.
 */
const title = "אודות קומי קומי הפקות | הפקות אירועים לילדים ולנוער";
const description = "נעים להכיר: קומי קומי הפקות מתמחים ביצירת חוויות, ימי הולדת ואירועי קונספט לילדים ולנוער. מפיקת האירועים לירז בר מלווה אתכם מתחילת האירוע ועד סופו.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/about" }, openGraph: { title, description, url: "/about" } };

export default function AboutPage() {
  const a = he.home.about;
  const m = he.home.mitzvah;
  const trail = [{ path: "/about", label: a.eyebrow }];
  return (
    <>
      <section className="wrap pt-10 pb-14 md:pt-14 md:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <p className="eyebrow">{a.title}</p>
            <h1 className="h-display mt-2 text-[2.25rem] md:text-[3.25rem]">{a.eyebrow}</h1>
            <StringLine />
            <div className="prose-he mt-6 max-w-xl text-[1.125rem] leading-[1.8]">
              {a.p.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/quote" className="btn btn-primary">
                {he.common.quote}
              </Link>
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                <WhatsAppIcon className="text-[#128c7e]" />
                {he.common.whatsapp}
              </a>
            </div>
          </div>
          <Photo id={home.hero} alt={site.nameHe} ratio="4 / 3" priority sizes="(min-width: 1024px) 520px, 92vw" />
        </div>
      </section>

      <section aria-labelledby="why-title" className="bg-violet-soft">
        <div className="wrap py-14 md:py-20">
          <h2 id="why-title" className="h-display text-[1.875rem] md:text-[2.5rem]">
            {a.whyTitle}
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {a.why.map((w) => (
              <li key={w.t} className="card flex gap-4 p-6">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet text-white">
                  <CheckIcon width={15} height={15} />
                </span>
                <span>
                  <span className="block font-[family-name:var(--font-display)] text-[1.125rem] font-bold">{w.t}</span>
                  <span className="mt-1 block leading-relaxed text-muted">{w.d}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[1.125rem] font-medium">{a.closing}</p>
        </div>
      </section>

      <section aria-labelledby="company-title" className="wrap py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <h2 id="company-title" className="h-display text-[1.875rem] md:text-[2.5rem]">
              {m.title}
            </h2>
            <div className="prose-he mt-6 max-w-2xl text-[1.0625rem] leading-[1.8]">
              {m.p.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <div className="card p-6">
              <h3 className="font-[family-name:var(--font-display)] text-[1.125rem] font-bold">
                {he.contact.producer}: {site.producer}
              </h3>
              <ul className="mt-3">
                {site.phones.map((p) => (
                  <li key={p.intl}>
                    <a href={`tel:${p.intl}`} dir="ltr" className="inline-flex min-h-11 items-center gap-2 text-[1.125rem] tabular-nums transition-colors hover:text-violet">
                      <PhoneIcon width={18} height={18} />
                      {p.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <h3 className="font-[family-name:var(--font-display)] text-[1.125rem] font-bold">{he.contact.regions}</h3>
              <ul className="mt-3 space-y-1 text-muted">
                {site.regions.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="about-reviews" className="bg-violet-soft">
        <div className="wrap py-14 md:py-20">
          <h2 id="about-reviews" className="h-display text-[1.875rem] md:text-[2.5rem]">
            {he.reviews.title}
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {featuredAvis.slice(0, 3).map((r) => (
              <li key={r.id}>
                <ReviewCard a={r} clamp />
              </li>
            ))}
          </ul>
          <Link href="/reviews" className="btn btn-ghost mt-8">
            {he.reviews.title} ({avis.length})
          </Link>
        </div>
      </section>

      <CtaBand title={he.contact.title} text={a.closing} />
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "AboutPage", name: title, description, url: `${site.url}/about`, inLanguage: "he", mainEntity: { "@id": `${site.url}/#business` } },
          breadcrumbJsonLd(trail),
        ]}
      />
    </>
  );
}
