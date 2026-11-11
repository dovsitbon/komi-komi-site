import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PrestationCard, SectionTitle } from "@/components/blocks";
import { JsonLd } from "@/components/JsonLd";
import { StringLine } from "@/components/icons";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { prestationCats, prestations } from "@/lib/site";
import he from "@/locales/he.json";

const title = "קטלוג אטרקציות לאירועים | תקליטן, ליצנים, בר מתוקים – קומי קומי";
const description = "כל האטרקציות לאירוע במקום אחד: תקליטן, ליצנים, בר מתוקים, דוכני מזון, שולחנות משחק, מגנטים, גרפיטי על כובעים, קירות צילום ותחנות לפורים. מוסיפים להצעת המחיר ושולחים.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/catalog" }, openGraph: { title, description, url: "/catalog" } };

export default function CatalogPage() {
  const p = he.page;
  const groups = Object.entries(prestationCats).map(([cat, label]) => ({ cat, label, items: prestations.filter((x) => x.cat === cat) }));
  return (
    <>
      <section className="wrap pt-10 pb-8 md:pt-14">
        <p className="eyebrow">{he.home.catalogEyebrow}</p>
        <h1 className="h-display mt-2 text-[2.25rem] md:text-[3.25rem]">{p.catalogTitle}</h1>
        <StringLine />
        <p className="lead mt-6 max-w-2xl">{p.catalogText}</p>
        <nav aria-label={p.catalogTitle} className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <li key={g.cat}>
                <a href={`#${g.cat}`} className="chip">
                  {g.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>
      {groups.map((g) => (
        <section key={g.cat} id={g.cat} aria-labelledby={`${g.cat}-title`} className="wrap scroll-mt-28 py-10 md:py-12">
          <SectionTitle id={`${g.cat}-title`} title={g.label} />
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {g.items.map((x) => (
              <li key={x.id}>
                <PrestationCard p={x} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      <div className="wrap pb-14">
        <Link href="/quote" className="btn btn-primary">
          {he.cart.continue}
        </Link>
      </div>
      <CtaBand title={p.ctaTitle} text={p.ctaText} />
      <JsonLd data={breadcrumbJsonLd([{ path: "/catalog", label: "קטלוג" }])} />
    </>
  );
}
