import { breadcrumbs, cities, getPrestation, prestations, site, type Page } from "@/lib/site";
import he from "@/locales/he.json";

const abs = (path: string) => `${site.url}${path === "/" ? "" : path}`;
const ORG_ID = `${site.url}/#business`;

/** Entreprise : EntertainmentBusiness + EventPlanner (LocalBusiness), avec zones desservies et prestations. */
export function businessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["EntertainmentBusiness", "LocalBusiness"],
    additionalType: "https://schema.org/EventPlanner",
    "@id": ORG_ID,
    name: site.nameHe,
    alternateName: site.nameLatin,
    description: he.meta.description,
    url: site.url,
    image: `${site.url}/og.jpg`,
    logo: `${site.url}/logo.svg`,
    telephone: site.phones[0].intl,
    contactPoint: site.phones.map((p) => ({ "@type": "ContactPoint", telephone: p.intl, contactType: "customer service", availableLanguage: ["he"] })),
    address: { "@type": "PostalAddress", addressCountry: "IL" },
    areaServed: [{ "@type": "Country", name: "Israel" }, ...cities.map((c) => ({ "@type": "City", name: c.name }))],
    sameAs: [site.facebook, site.instagram],
    knowsLanguage: "he",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: he.page.catalogTitle,
      itemListElement: prestations.map((p) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: p.name, description: p.short, url: abs(p.page) } })),
    },
  };
}

export function breadcrumbJsonLd(trail: { path: string; label: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ path: "/", label: he.common.home }, ...trail].map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.label, item: abs(t.path) })),
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/** Une page = un Service rendu par l'entreprise, dans la ville de la page quand il y en a une. */
export function serviceJsonLd(page: Page) {
  const price = page.meta.prestation ? getPrestation(page.meta.prestation)?.priceFrom : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.h1,
    description: page.description,
    url: abs(page.path),
    serviceType: page.eyebrow || page.nav,
    provider: { "@id": ORG_ID },
    areaServed: page.meta.city ? { "@type": "City", name: page.meta.city } : { "@type": "Country", name: "Israel" },
    ...(price && site.showPrices ? { offers: { "@type": "Offer", priceCurrency: "ILS", price, description: `${he.common.from}${price} ₪` } } : {}),
  };
}

export const pageJsonLd = (page: Page, faq: { q: string; a: string }[]) => [serviceJsonLd(page), breadcrumbJsonLd(breadcrumbs(page)), ...(faq.length ? [faqJsonLd(faq)] : [])];

