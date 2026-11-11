import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { FacebookIcon, InstagramIcon, PhoneIcon, StringLine, WhatsAppIcon } from "@/components/icons";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { site, waLink } from "@/lib/site";
import he from "@/locales/he.json";

const title = "צרו קשר | קומי קומי הפקות – 052-319-0259";
const description = "מדברים עם קומי קומי הפקות: טלפון, וואטסאפ וטופס הצעת מחיר. ימי הולדת, בר ובת מצווה, פול מון ופורים, בצפון ובמרכז.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/contact" }, openGraph: { title, description, url: "/contact" } };

export default function ContactPage() {
  const c = he.contact;
  return (
    <>
      <section className="wrap pt-10 pb-16 md:pt-14 md:pb-24">
        <div className="max-w-2xl">
          <p className="eyebrow">{c.eyebrow}</p>
          <h1 className="h-display mt-2 text-[2.25rem] md:text-[3.25rem]">{c.title}</h1>
          <StringLine />
          <p className="lead mt-6">{c.text}</p>
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
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <div className="card p-6">
            <h2 className="font-[family-name:var(--font-display)] text-[1.125rem] font-bold">{c.phones}</h2>
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
            <p className="mt-3 text-[0.9375rem] text-muted">
              {c.producer}: {site.producer}
            </p>
          </div>
          <div className="card p-6">
            <h2 className="font-[family-name:var(--font-display)] text-[1.125rem] font-bold">{c.regions}</h2>
            <ul className="mt-3 space-y-1 text-muted">
              {site.regions.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="font-[family-name:var(--font-display)] text-[1.125rem] font-bold">{c.social}</h2>
            <ul className="mt-3">
              <li>
                <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-violet">
                  <FacebookIcon /> Facebook
                </a>
              </li>
              <li>
                <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-violet" dir="ltr">
                  <InstagramIcon /> @{site.instagramHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
      <JsonLd data={breadcrumbJsonLd([{ path: "/contact", label: c.title }])} />
    </>
  );
}
