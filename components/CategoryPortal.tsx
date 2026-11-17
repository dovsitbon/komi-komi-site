import Link from "next/link";
import home from "@/data/home.json";
import { Slideshow, type Slide } from "@/components/Slideshow";
import { ArrowIcon, BallIcon, HeartIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { getMedia, getPage, getPrestation, site, telHref, waLink } from "@/lib/site";
import he from "@/locales/he.json";

/**
 * Premier écran du site, demandé par le client (vocaux du 12 novembre 2026, maquette C retenue) :
 * dès l'arrivée, le visiteur choisit sa catégorie. Chaque catégorie est un aplat de couleur du logo, avec ses photos
 * qui défilent. Le texte est toujours SOUS la photo, jamais dessus.
 */
const t = home.tiles as Record<string, string>;

// Photos de la catégorie, tirées de ses pages. Seules les photos horizontales (proches du cadre 4:3) sont gardées,
// pour qu'aucune ne soit coupée au mauvais endroit.
const from = (first: string | null | undefined, paths: string[], max = 6): Slide[] => {
  const ids = [first, ...paths.flatMap((p) => getPage(p)?.images.slice(0, 6) ?? [])].filter((x): x is string => !!x);
  return [...new Set(ids)]
    .map((id) => getMedia(id))
    .filter((m): m is Slide => !!m && m.w / m.h >= 1.25 && m.w / m.h <= 1.8)
    .slice(0, max);
};

const p = he.portal;
type Cat = { href: string; title: string; text: string; tone: string; img: Slide[]; Icon?: typeof BallIcon };
const CATS: Cat[] = [
  { href: "/bar-mitzvah", ...p.cats[0], tone: "bg-sun", img: from(home.hero, ["/bar-mitzvah", "/catalog/photo-walls"]) },
  { href: "/bat-mitzvah", ...p.cats[1], tone: "bg-pink", img: from(t["bat-mitzvah"], ["/bat-mitzvah"]) },
  { href: "/bar-mitzvah/kids", ...p.cats[6], tone: "bg-[#ceff4c]", img: from(null, ["/bar-mitzvah/dj", "/bat-mitzvah/dj", "/bar-mitzvah/kids"]) },
  { href: "/birthdays/boys", ...p.cats[2], tone: "bg-[#4dfdf3]", Icon: BallIcon, img: from(t["birthdays/boys"], ["/birthdays/fortnite", "/birthdays/football", "/birthdays/pokemon", "/birthdays/superheroes"]) },
  { href: "/birthdays/girls", ...p.cats[3], tone: "bg-pink", Icon: HeartIcon, img: from(t["birthdays/girls"], ["/birthdays/unicorn", "/birthdays/spa-stitch", "/birthdays/lol-spa", "/birthdays/barbie"]) },
  { href: "/candy-bar", ...p.cats[4], tone: "bg-sun", img: from(getPrestation("candy-bar")?.image, ["/candy-bar", "/candy-bar/brit", "/candy-bar/bar-mitzvah"]) },
  { href: "/full-moon", ...p.cats[5], tone: "bg-[#4dfdf3]", img: from(t["full-moon"], ["/full-moon"]) },
  { href: "/aliyah-latorah", ...p.cats[7], tone: "bg-[#ceff4c]", img: from(null, ["/aliyah-latorah", "/bar-mitzvah"]) },
  { href: "/catalog/photo-walls", ...p.cats[8], tone: "bg-pink", img: from(null, ["/catalog/photo-walls"]) },
  { href: "/catalog/fair-stands", ...p.cats[9], tone: "bg-sun", img: from(null, ["/catalog/fair-stands", "/purim/market-booths"]) },
  { href: "/catalog/food-stands", ...p.cats[10], tone: "bg-[#4dfdf3]", img: from(null, ["/catalog/food-stands"]) },
  { href: "/photo-booths", ...p.cats[11], tone: "bg-[#ceff4c]", img: from(null, ["/photo-booths", "/catalog/magnets", "/catalog/photo-walls"]) },
  { href: "/catering", ...p.cats[12], tone: "bg-pink", img: from(null, ["/catering", "/catalog/food-stands"]) },
  { href: "/purim", ...p.cats[13], tone: "bg-sun", img: from(t.purim, ["/purim"]) },
  { href: "/corporate", ...p.cats[14], tone: "bg-[#4dfdf3]", img: from(t.corporate, ["/corporate"]) },
];
const MORE = [
  ["/clowns", "ליצנים"],
  ["/birthdays/dj", "תקליטן לאירועים"],
  ["/brit", "בריתות"],
  ["/about", "אודות"],
  ["/catalog", "כל הקטלוג"],
] as const;

// Fond du bandeau de titre : une grande photo par catégorie
const BACKDROP = CATS.flatMap((c) => c.img.filter((m) => m.w >= 1200).slice(0, 1));

export function CategoryPortal() {
  return (
    <>
      <section aria-labelledby="pick-title" className="on-dark relative overflow-hidden bg-night text-white">
        <Slideshow fill slides={BACKDROP} alt="" sizes="100vw" priority />
        <div className="absolute inset-0 bg-night/65" aria-hidden="true" />
        <div className="wrap relative flex min-h-[20rem] flex-col items-center justify-center py-12 text-center md:min-h-[26rem]">
          <h1 id="pick-title" className="h-display text-[2.75rem] md:text-[4.5rem]">
            {p.title}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[1.1875rem] font-medium md:text-[1.375rem]">{p.text}</p>
        </div>
      </section>
      <section aria-label={p.title} className="wrap pb-12 md:pb-16">
      <ul className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:gap-5 lg:grid-cols-3">
        {CATS.map((c, i) => (
          <li key={c.href} className="cat-in" style={{ animationDelay: `${i * 90}ms` }}>
            <Link href={c.href} className={`cat-tile group flex h-full flex-col rounded-[32px] p-3 md:p-4 ${c.tone}`}>
              <Slideshow slides={c.img} delay={i * 600} alt={c.title} ratio="4 / 3" priority={i < 3} sizes="(min-width: 1024px) 390px, 46vw" className="!rounded-[22px]" />
              <div className="flex flex-1 flex-col px-2 pt-4 pb-2 md:px-3">
                <div className="flex items-center gap-3">
                  {c.Icon && (
                    <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-pink-ink sm:flex">
                      <c.Icon width={24} height={24} />
                    </span>
                  )}
                  <h2 className="h-display text-[1.3125rem] md:text-[1.875rem]">{c.title}</h2>
                </div>
                <p className="mt-1.5 flex-1 text-[0.9375rem] font-medium text-ink/85 md:text-[1.0625rem]">{c.text}</p>
                <span className="cat-go mt-4 inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-ink px-4 font-[family-name:var(--font-display)] font-bold whitespace-nowrap text-white transition-colors group-hover:bg-white group-hover:text-ink md:px-5">
                  {p.go}
                  <ArrowIcon />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 text-center">
        <h2 className="h-display text-[1.375rem] md:text-[1.625rem]">{p.more}</h2>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {MORE.map(([href, label]) => (
            <li key={href}>
              <Link href={href} className="inline-flex min-h-12 items-center rounded-full bg-violet-soft px-5 font-bold transition-colors hover:bg-violet hover:text-white">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/quote" className="btn btn-primary !min-h-14 !px-8 !text-[1.125rem]">
            {he.common.quote}
          </Link>
          <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !min-h-14 !px-7 !text-[1.125rem]">
            <WhatsAppIcon className="text-[#128c7e]" />
            {he.common.whatsapp}
          </a>
          {site.phones.map((ph, n) => (
            <a key={ph.intl} href={telHref(n)} dir="ltr" className="btn btn-ghost !min-h-14 !px-6 !text-[1.125rem] tabular-nums">
              <PhoneIcon width={20} height={20} />
              {ph.label}
            </a>
          ))}
        </div>
      </div>
      </section>
    </>
  );
}
