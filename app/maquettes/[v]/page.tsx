import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import home from "@/data/home.json";
import { Slideshow, type Slide } from "@/components/Slideshow";
import { ArrowIcon, BallIcon, HeartIcon, WhatsAppIcon } from "@/components/icons";
import { getMedia, getPage, getPrestation, waLink } from "@/lib/site";

/**
 * Trois maquettes de la page d'accueil, à comparer avec le client (retours du 12 novembre 2026).
 * Principe commun, demandé par le client : dès l'arrivée, avant tout le reste, le visiteur choisit sa catégorie
 * (בר מצווה, בת מצווה, ימי הולדת לבנים, לבנות, בר מתוקים, פול מון). Chaque catégorie a ses photos qui défilent.
 * Le texte est toujours SOUS la photo, jamais dessus : aucune photo n'est recouverte ni recadrée par un titre.
 * A « clair », B « sombre et lumineux », C « coloré ». Non indexées, hors sitemap.
 */
const VARIANTS = ["a", "b", "c"] as const;
type V = (typeof VARIANTS)[number];
type Props = { params: Promise<{ v: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => VARIANTS.map((v) => ({ v }));
export const metadata: Metadata = { title: "קומי קומי הפקות – הצעות עיצוב", robots: { index: false, follow: false } };

const t = home.tiles as Record<string, string>;
const AGES = "הפעלות מגיל 4 עד גיל 11";

// Photos de chaque catégorie, tirées de ses pages. On ne garde que les photos horizontales (proches du cadre 4:3),
// pour qu'aucune ne soit coupée au mauvais endroit.
const from = (first: string | null | undefined, paths: string[], max = 6): Slide[] => {
  const ids = [first, ...paths.flatMap((p) => getPage(p)?.images.slice(0, 6) ?? [])].filter((x): x is string => !!x);
  return [...new Set(ids)]
    .map((id) => getMedia(id))
    .filter((m): m is Slide => !!m && m.w / m.h >= 1.25 && m.w / m.h <= 1.8)
    .slice(0, max);
};

const CATS = [
  { href: "/bar-mitzvah", title: "בר מצווה", text: "הפקה, כניסות, תקליטן וקירות צילום", img: from(home.hero, ["/bar-mitzvah", "/catalog/photo-walls"]) },
  { href: "/bat-mitzvah", title: "בת מצווה", text: "קונספט, עיצוב, ריקוד וסלואו", img: from(t["bat-mitzvah"], ["/bat-mitzvah"]) },
  { href: "/birthdays/boys", title: "ימי הולדת לבנים", text: AGES, Icon: BallIcon, img: from(t["birthdays/boys"], ["/birthdays/fortnite", "/birthdays/football", "/birthdays/pokemon", "/birthdays/superheroes"]) },
  { href: "/birthdays/girls", title: "ימי הולדת לבנות", text: AGES, Icon: HeartIcon, img: from(t["birthdays/girls"], ["/birthdays/unicorn", "/birthdays/spa-stitch", "/birthdays/lol-spa", "/birthdays/barbie"]) },
  { href: "/candy-bar", title: "בר מתוקים", text: "שולחן מתוקים מעוצב, כשר מהדרין", img: from(getPrestation("candy-bar")?.image, ["/candy-bar", "/candy-bar/brit", "/candy-bar/bar-mitzvah"]) },
  { href: "/full-moon", title: "פול מון", text: "מסיבה זוהרת באולטרה סגול", img: from(t["full-moon"], ["/full-moon"]) },
] as const;
const MORE = [["/purim", "פורים"], ["/clowns", "ליצנים"], ["/birthdays/dj", "תקליטנים"], ["/catalog/food-stands", "דוכני מזון"], ["/corporate", "אירועים עסקיים"], ["/catalog", "כל הקטלוג"]] as const;

const H = "font-[family-name:var(--font-display)] font-extrabold leading-[1.1]";

// Habillage de chaque maquette : seule la peau change, la structure est la même
const SKIN: Record<V, { page: string; lead: string; card: (i: number) => string; frame: string; title: string; text: string; go: string; icon: string; chip: string; dark: boolean }> = {
  a: {
    page: "bg-white",
    lead: "text-muted",
    card: () => "bg-white border-2 border-ink rounded-[24px] hover:border-violet",
    frame: "!rounded-none",
    title: "group-hover:text-violet",
    text: "text-muted",
    go: "bg-pink text-ink group-hover:bg-sun",
    icon: "bg-violet text-white",
    chip: "border-2 border-ink bg-white hover:bg-ink hover:text-white",
    dark: false,
  },
  b: {
    page: "on-dark bg-night text-white",
    lead: "text-white/80",
    card: () => "bg-[#251d36] rounded-[24px] ring-1 ring-white/15 hover:ring-2 hover:ring-neon-lime",
    frame: "!rounded-none",
    title: "group-hover:text-neon-lime",
    text: "text-white/75",
    go: "bg-neon-lime text-ink group-hover:bg-white",
    icon: "bg-neon-pink text-ink",
    chip: "border-2 border-white/30 text-white hover:border-neon-lime hover:text-neon-lime",
    dark: true,
  },
  c: {
    page: "bg-white",
    lead: "text-muted",
    card: (i) => `${["bg-sun", "bg-pink", "bg-[#4dfdf3]", "bg-[#ceff4c]", "bg-pink", "bg-sun"][i]} rounded-[32px] p-3 md:p-4`,
    frame: "!rounded-[22px]",
    title: "",
    text: "text-ink/80",
    go: "bg-ink text-white group-hover:bg-white group-hover:text-ink",
    icon: "bg-white text-pink-ink",
    chip: "bg-violet-soft font-bold hover:bg-violet hover:text-white",
    dark: false,
  },
};

export default async function Maquette({ params }: Props) {
  const { v } = await params;
  if (!VARIANTS.includes(v as V)) notFound();
  const s = SKIN[v as V];
  const names: Record<V, string> = { a: "A · בהיר ונקי", b: "B · כהה וזוהר", c: "C · צבעוני ושמח" };
  const padded = v === "c";

  return (
    <>
      <nav aria-label="הצעות עיצוב" className="border-b border-line bg-sun-soft">
        <ul className="wrap flex flex-wrap items-center gap-2 py-2 text-[0.9375rem]">
          <li className="font-bold">הצעת עיצוב:</li>
          {VARIANTS.map((x) => (
            <li key={x}>
              <Link href={`/maquettes/${x}`} aria-current={x === v ? "page" : undefined} className={`inline-flex min-h-10 items-center rounded-full px-4 font-bold ${x === v ? "bg-ink text-white" : "bg-white"}`}>
                {names[x]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={s.page}>
        {/* Premier écran : on choisit sa catégorie */}
        <section aria-labelledby="pick-title" className="wrap pt-8 pb-12 md:pt-12 md:pb-16">
          <div className="text-center">
            <h1 id="pick-title" className={`${H} text-[2.25rem] md:text-[3.5rem]`}>
              מה חוגגים?
            </h1>
            <p className={`mx-auto mt-3 max-w-2xl text-[1.125rem] font-medium md:text-[1.25rem] ${s.lead}`}>קומי קומי הפקות: בר ובת מצווה, ימי הולדת ואירועים לילדים ולנוער. בחרו קטגוריה ונכנסים.</p>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-3 md:mt-10 md:gap-5 lg:grid-cols-3">
            {CATS.map((c, i) => (
              <li key={c.href}>
                <Link href={c.href} className={`group flex h-full flex-col overflow-hidden transition-[border-color,box-shadow] duration-200 ${s.card(i)}`}>
                  {/* La photo garde son cadre 4:3 entier ; le texte vient en dessous */}
                  <Slideshow slides={c.img} delay={i * 600} alt={c.title} ratio="4 / 3" priority={i < 3} sizes="(min-width: 1024px) 390px, 46vw" className={s.frame} />
                  <div className={`flex flex-1 flex-col ${padded ? "px-2 pt-4 pb-2 md:px-3" : "p-4 md:p-6"}`}>
                    <div className="flex items-center gap-3">
                      {"Icon" in c && (
                        <span className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-full sm:flex ${s.icon}`}>
                          <c.Icon width={24} height={24} />
                        </span>
                      )}
                      <h2 className={`${H} text-[1.25rem] transition-colors md:text-[1.875rem] ${s.title}`}>{c.title}</h2>
                    </div>
                    <p className={`mt-1.5 flex-1 text-[0.9375rem] font-medium md:text-[1.0625rem] ${s.text}`}>{c.text}</p>
                    <span className={`mt-4 inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full px-4 whitespace-nowrap md:px-5 font-[family-name:var(--font-display)] font-bold transition-colors ${s.go}`}>
                      לחצו כאן
                      <ArrowIcon />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 text-center">
            <h2 className={`${H} text-[1.25rem] md:text-[1.5rem]`}>עוד אירועים ושירותים</h2>
            <ul className="mt-4 flex flex-wrap justify-center gap-2">
              {MORE.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className={`inline-flex min-h-12 items-center rounded-full px-5 font-bold transition-colors ${s.chip}`}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/quote" className="btn btn-primary !min-h-14 !px-8 !text-[1.125rem]">
                לקבלת הצעת מחיר
              </Link>
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !min-h-14 !px-7 !text-[1.125rem] !font-bold">
                <WhatsAppIcon className={s.dark ? "" : "text-[#128c7e]"} />
                וואטסאפ
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
