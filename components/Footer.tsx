import Link from "next/link";
import { Logo } from "@/components/Logo";
import { FacebookIcon, InstagramIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { cities, pages, prestations, regions, site, themes, waLink } from "@/lib/site";
import he from "@/locales/he.json";

const events = ["/bar-mitzvah", "/bat-mitzvah", "/full-moon", "/purim", "/corporate", "/brit", "/candy-bar", "/reviews", "/contact", "/quote"];
const label = (path: string) => pages.find((p) => p.path === path)?.nav || { "/reviews": he.reviews.title, "/contact": he.contact.title, "/quote": he.quote.title }[path] || path;

/** Pied de page : coordonnées, régions, et plan du site complet (utile aux visiteurs comme à Google). */
export function Footer() {
  const f = he.footer;
  return (
    <footer className="on-dark bg-violet-deep text-white">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.2fr_1fr_1fr] md:py-20">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm text-white/80">{f.tagline}</p>
          <div className="mt-6 flex gap-2">
            <a href={site.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 transition-colors hover:bg-white hover:text-violet-deep">
              <FacebookIcon />
            </a>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 transition-colors hover:bg-white hover:text-violet-deep">
              <InstagramIcon />
            </a>
          </div>
        </div>
        <div>
          <h2 className="eyebrow">{f.contact}</h2>
          <ul className="mt-4 space-y-1">
            {site.phones.map((p) => (
              <li key={p.intl}>
                <a href={`tel:${p.intl}`} dir="ltr" className="inline-flex min-h-11 items-center gap-2 tabular-nums transition-colors hover:text-sun">
                  <PhoneIcon width={18} height={18} />
                  {p.label}
                </a>
              </li>
            ))}
            <li>
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-sun">
                <WhatsAppIcon width={18} height={18} />
                {he.common.whatsapp}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="eyebrow">{f.regions}</h2>
          <ul className="mt-4 space-y-2 text-white/80">
            {site.regions.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>

      <nav aria-label={f.sitemap} className="border-t border-white/15">
        <div className="wrap grid gap-10 py-12 text-[0.9375rem] sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="eyebrow">{f.events}</h2>
            <ul className="mt-3 columns-2 gap-6 sm:columns-1">
              {events.map((p) => (
                <li key={p}>
                  <Link href={p} className="inline-flex min-h-9 items-center text-white/80 transition-colors hover:text-sun">
                    {label(p)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="eyebrow">
              <Link href="/birthdays" className="hover:text-white">
                {f.birthdays}
              </Link>
            </h2>
            <ul className="mt-3 columns-2 gap-6">
              {themes.map((t) => (
                <li key={t.slug}>
                  <Link href={`/birthdays/${t.slug}`} className="inline-flex min-h-9 items-center text-white/80 transition-colors hover:text-sun">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="eyebrow">
              <Link href="/catalog" className="hover:text-white">
                {f.catalog}
              </Link>
            </h2>
            <ul className="mt-3 columns-2 gap-6">
              {prestations.map((p) => (
                <li key={p.id}>
                  <Link href={p.page} className="inline-flex min-h-9 items-center text-white/80 transition-colors hover:text-sun">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="eyebrow">
              <Link href="/clowns" className="hover:text-white">
                {f.clowns}
              </Link>
            </h2>
            <ul className="mt-3">
              {regions.map((r) => (
                <li key={r.slug}>
                  <Link href={`/clowns/${r.slug}`} className="inline-flex min-h-9 items-center text-white/80 transition-colors hover:text-sun">
                    {r.h1}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/clowns/ages" className="inline-flex min-h-9 items-center text-white/80 transition-colors hover:text-sun">
                  {he.page.byAge}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Toutes les villes : liens courts sur une seule zone, pour le référencement local */}
        <div className="wrap border-t border-white/15 py-8">
          <h2 className="eyebrow">{he.page.cities}</h2>
          <ul className="mt-3 flex flex-wrap gap-x-4 text-[0.875rem]">
            {cities.map((c) => (
              <li key={c.slug}>
                <Link href={`/clowns/${c.slug}`} className="inline-flex min-h-9 items-center text-white/70 transition-colors hover:text-sun">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="border-t border-white/15">
        <div className="wrap flex flex-col gap-2 py-6 pb-28 text-[0.875rem] text-white/70 sm:flex-row sm:items-center sm:justify-between md:pb-6">
          <p>
            © {new Date().getFullYear()} {site.nameHe}. {f.rights}
          </p>
          <Link href="/legal" className="inline-flex min-h-9 items-center transition-colors hover:text-sun">
            {f.legal}
          </Link>
        </div>
      </div>
    </footer>
  );
}
