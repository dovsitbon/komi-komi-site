import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { QuoteForm } from "@/components/QuoteForm";
import { PhoneIcon, StringLine } from "@/components/icons";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { prestationCats, prestations, site, themes } from "@/lib/site";
import he from "@/locales/he.json";

const title = "הצעת מחיר לאירוע | קומי קומי הפקות";
const description = "ממלאים סוג אירוע, תאריך, עיר ומה שמעניין אתכם, ומקבלים הצעת מחיר מסודרת בוואטסאפ ליום הולדת, בר או בת מצווה, פול מון ופורים.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/quote" }, openGraph: { title, description, url: "/quote" } };

export default function QuotePage() {
  const q = he.quote;
  return (
    <>
      <section className="wrap pt-10 pb-16 md:pt-14 md:pb-24">
        <div className="max-w-2xl">
          <p className="eyebrow">{q.eyebrow}</p>
          <h1 className="h-display mt-2 text-[2.25rem] md:text-[3.25rem]">{q.title}</h1>
          <StringLine />
          <p className="lead mt-6">{q.text}</p>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px]">
          <Suspense fallback={null}>
            <QuoteForm prestations={prestations.map(({ id, name, cat }) => ({ id, name, cat }))} cats={prestationCats} themes={themes.map((t) => t.name)} hasEmail={!!site.email} />
          </Suspense>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="card p-6">
              <h2 className="font-[family-name:var(--font-display)] text-[1.125rem] font-bold">{he.contact.phones}</h2>
              <ul className="mt-3">
                {site.phones.map((p) => (
                  <li key={p.intl}>
                    <a href={`tel:${p.intl}`} dir="ltr" className="inline-flex min-h-11 items-center gap-2 tabular-nums transition-colors hover:text-violet">
                      <PhoneIcon width={18} height={18} />
                      {p.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[0.9375rem] text-muted">
                {he.contact.producer}: {site.producer}
              </p>
            </div>
          </aside>
        </div>
      </section>
      <JsonLd data={breadcrumbJsonLd([{ path: "/quote", label: q.title }])} />
    </>
  );
}
