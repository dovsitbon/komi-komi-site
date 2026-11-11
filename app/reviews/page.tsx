import type { Metadata } from "next";
import videos from "@/data/videos.json";
import { CtaBand, ReviewCard, SectionTitle } from "@/components/blocks";
import { JsonLd } from "@/components/JsonLd";
import { YouTubeLite } from "@/components/YouTubeLite";
import { StringLine, WhatsAppIcon } from "@/components/icons";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { avis, waLink } from "@/lib/site";
import he from "@/locales/he.json";

const title = "לקוחות ממליצים | המלצות על קומי קומי הפקות";
const description = "המלצות של הורים על ימי הולדת, בר ובת מצווה, מסיבות פול מון ופורים עם קומי קומי הפקות, כפי שנכתבו בספר ההמלצות, והמלצות בווידאו.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/reviews" }, openGraph: { title, description, url: "/reviews" } };

export default function ReviewsPage() {
  const r = he.reviews;
  const tags = [...new Set(avis.map((a) => a.tag))];
  const anchor = (t: string) => `tag-${tags.indexOf(t) + 1}`;
  return (
    <>
      <section className="wrap pt-10 pb-8 md:pt-14">
        <p className="eyebrow">{r.eyebrow}</p>
        <h1 className="h-display mt-2 text-[2.25rem] md:text-[3.25rem]">{r.title}</h1>
        <StringLine />
        <p className="lead mt-6 max-w-2xl">{r.text}</p>
        <nav aria-label={r.title} className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <li key={t}>
                <a href={`#${anchor(t)}`} className="chip">
                  {t} <span className="tabular-nums opacity-70">{avis.filter((a) => a.tag === t).length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      {videos.reviews.length > 0 && (
        <section aria-labelledby="video-title" className="bg-violet-soft">
          <div className="wrap py-14 md:py-16">
            <SectionTitle id="video-title" title={r.videoTitle} />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {videos.reviews.slice(0, 9).map((v, i) => (
                <YouTubeLite key={v} id={v} title={`${r.videoTitle} ${i + 1}`} />
              ))}
            </div>
          </div>
        </section>
      )}

      {tags.map((t) => (
        <section key={t} id={anchor(t)} aria-labelledby={`${anchor(t)}-title`} className="wrap scroll-mt-28 py-10 md:py-12">
          <h2 id={`${anchor(t)}-title`} className="h-display text-[1.75rem]">
            {t}
          </h2>
          <ul className="mt-6 columns-1 gap-5 md:columns-2 lg:columns-3 [&>li]:mb-5 [&>li]:break-inside-avoid">
            {avis
              .filter((a) => a.tag === t)
              .map((a) => (
                <li key={a.id}>
                  <ReviewCard a={a} />
                </li>
              ))}
          </ul>
        </section>
      ))}

      <div className="wrap pb-14">
        <a href={waLink("שלום, חגגנו איתכם ורצינו להשאיר המלצה:")} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
          <WhatsAppIcon className="text-[#128c7e]" />
          {r.leave}
        </a>
      </div>
      <CtaBand title={he.page.ctaTitle} text={he.page.ctaText} />
      <JsonLd data={breadcrumbJsonLd([{ path: "/reviews", label: r.title }])} />
    </>
  );
}
