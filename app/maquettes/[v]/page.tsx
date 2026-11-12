import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import home from "@/data/home.json";
import { Slideshow, type Slide } from "@/components/Slideshow";
import { ArrowIcon, BallIcon, HeartIcon, WhatsAppIcon } from "@/components/icons";
import { getMedia, getPage, getPrestation, waLink } from "@/lib/site";

/**
 * Trois maquettes de la page d'accueil, à comparer avec le client (retours du 12 novembre 2026) :
 * A « bannières XXL », B « sombre et lumineux », C « coloré et ludique ». Non indexées, hors sitemap.
 * Le gabarit retenu remplacera app/page.tsx ; ce dossier sera alors supprimé.
 */
const VARIANTS = ["a", "b", "c"] as const;
type V = (typeof VARIANTS)[number];
type Props = { params: Promise<{ v: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => VARIANTS.map((v) => ({ v }));
export const metadata: Metadata = { title: "קומי קומי הפקות – הצעות עיצוב", robots: { index: false, follow: false } };

const t = home.tiles as Record<string, string>;
const AGES = "הפעלות מגיל 4 עד גיל 11";
const TITLE = "הפקות בר ובת מצווה, ימי הולדת ואירועים לילדים ולנוער";
const SUB = "בוחרים אירוע, ואנחנו מגיעים עם הכל: תפאורה, תקליטן, מפעילים ובר מתוקים.";

// Photos de chaque catégorie, tirées de ses pages : elles défilent en fond de la bannière
const from = (first: string | null | undefined, paths: string[], max = 6): Slide[] => {
  const ids = [first, ...paths.flatMap((p) => getPage(p)?.images.slice(0, 3) ?? [])].filter((x): x is string => !!x);
  return [...new Set(ids)].slice(0, max).map((id) => getMedia(id)).filter((m): m is Slide => !!m);
};
const S = {
  mitzvah: from(home.hero, ["/bar-mitzvah", "/bat-mitzvah"]),
  birthdays: from(t["birthdays/boys"], ["/birthdays/unicorn", "/birthdays/fortnite", "/birthdays/barbie", "/birthdays/pokemon"]),
  boys: from(t["birthdays/boys"], ["/birthdays/fortnite", "/birthdays/football", "/birthdays/pokemon", "/birthdays/superheroes"]),
  girls: from(t["birthdays/girls"], ["/birthdays/barbie", "/birthdays/spa-stitch", "/birthdays/lol-spa", "/birthdays/unicorn"]),
  bar: from(t["bar-mitzvah"], ["/bar-mitzvah", "/catalog/photo-walls"]),
  bat: from(t["bat-mitzvah"], ["/bat-mitzvah"]),
  candy: from(getPrestation("candy-bar")?.image, ["/candy-bar", "/candy-bar/brit"]),
};

const MAIN = [
  { href: "/bar-mitzvah", title: "הפקות בר ובת מצווה", text: "כניסות, תקליטן, קירות צילום ובר מתוקים", img: S.mitzvah },
  { href: "/birthdays", title: "הפקות ימי הולדת", text: "הפעלות לפי נושא, לבנים ולבנות", img: S.birthdays },
] as const;
const KIDS = [
  { href: "/birthdays/boys", title: "ימי הולדת לבנים", text: "גיימינג, כדורגל, גיבורי על", img: S.boys, Icon: BallIcon },
  { href: "/birthdays/girls", title: "ימי הולדת לבנות", text: "ספא, ברבי, חד קרן, טיק טוק", img: S.girls, Icon: HeartIcon },
] as const;
const CATS = [
  { href: "/bar-mitzvah", title: "בר מצווה", img: S.bar },
  { href: "/bat-mitzvah", title: "בת מצווה", img: S.bat },
  { href: "/birthdays", title: "ימי הולדת", img: S.girls },
  { href: "/candy-bar", title: "בר מתוקים", img: S.candy },
] as const;
const MORE = [["/full-moon", "פול מון"], ["/purim", "פורים"], ["/clowns", "ליצנים"], ["/birthdays/dj", "תקליטנים"], ["/catalog/food-stands", "דוכני מזון"], ["/corporate", "אירועים עסקיים"], ["/catalog", "כל הקטלוג"]] as const;

const Cta = ({ dark = false }: { dark?: boolean }) => (
  <div className="flex flex-wrap gap-3">
    <Link href="/quote" className="btn btn-primary !min-h-14 !px-8 !text-[1.125rem]">
      לקבלת הצעת מחיר
    </Link>
    <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !min-h-14 !px-7 !text-[1.125rem] !font-bold">
      <WhatsAppIcon className={dark ? "" : "text-[#128c7e]"} />
      וואטסאפ
    </a>
  </div>
);
const Click = ({ className = "" }: { className?: string }) => (
  <span className={`inline-flex min-h-12 items-center gap-2 rounded-full px-6 font-[family-name:var(--font-display)] text-[1.0625rem] font-bold ${className}`}>
    לחצו כאן
    <ArrowIcon />
  </span>
);
const More = ({ dark = false }: { dark?: boolean }) => (
  <ul className="flex flex-wrap gap-2">
    {MORE.map(([href, label]) => (
      <li key={href}>
        <Link href={href} className={dark ? "inline-flex min-h-12 items-center rounded-full border-2 border-white/30 px-5 font-bold text-white transition-colors hover:border-neon-lime hover:text-neon-lime" : "chip !min-h-12 !border-2 !px-5 !text-base font-bold"}>
          {label}
        </Link>
      </li>
    ))}
  </ul>
);
const H2 = "font-[family-name:var(--font-display)] font-extrabold leading-[1.1]";

/* ——— A : bannières XXL sur fond blanc, étiquette de couleur pleine sur chaque photo ——— */
function A() {
  const colors = ["bg-pink", "bg-sun"];
  return (
    <>
      <section className="wrap pt-10 pb-8 md:pt-14">
        <h1 className={`${H2} max-w-4xl text-[2.25rem] md:text-[3.75rem]`}>{TITLE}</h1>
        <p className="mt-4 max-w-2xl text-[1.1875rem] font-medium">{SUB}</p>
        <div className="mt-7">
          <Cta />
        </div>
      </section>
      <section className="wrap grid gap-5 pb-6 md:grid-cols-2">
        {MAIN.map((m, i) => (
          <Link key={m.href} href={m.href} className="group relative block">
            <Slideshow slides={m.img} delay={i * 1800} alt={m.title} ratio="4 / 3" priority sizes="(min-width: 768px) 600px, 92vw" className="!rounded-[28px]" />
            <div className={`relative mx-4 -mt-16 rounded-[24px] ${colors[i]} p-6 md:mx-6 md:-mt-20 md:p-8`}>
              <h2 className={`${H2} text-[1.875rem] md:text-[2.5rem]`}>{m.title}</h2>
              <p className="mt-1 text-[1.0625rem] font-medium">{m.text}</p>
              <Click className="mt-4 bg-ink text-white transition-colors group-hover:bg-violet" />
            </div>
          </Link>
        ))}
      </section>
      <section className="wrap grid gap-5 py-10 md:grid-cols-2">
        {KIDS.map((k) => (
          <Link key={k.href} href={k.href} className="group card flex items-stretch overflow-hidden !border-2 !border-ink transition-colors hover:!border-violet">
            <div className="w-2/5 shrink-0">
              <Slideshow slides={k.img} alt={k.title} ratio="1 / 1" sizes="(min-width: 768px) 240px, 40vw" className="h-full !rounded-none" />
            </div>
            <div className="flex flex-col justify-center p-5 md:p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet text-white">
                <k.Icon />
              </span>
              <h2 className={`${H2} mt-3 text-[1.5rem] md:text-[1.875rem]`}>{k.title}</h2>
              <p className="mt-1 font-bold text-pink-ink">{AGES}</p>
              <p className="mt-1 text-muted">{k.text}</p>
              <Click className="mt-3 !min-h-0 !px-0 text-violet" />
            </div>
          </Link>
        ))}
      </section>
      <section className="bg-violet-soft">
        <div className="wrap py-14">
          <h2 className={`${H2} text-[1.875rem] md:text-[2.5rem]`}>כל הקטגוריות</h2>
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {CATS.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="group block">
                  <Slideshow slides={c.img} delay={900} alt={c.title} ratio="1 / 1" sizes="(min-width: 768px) 290px, 46vw" />
                  <span className={`${H2} mt-3 block text-[1.375rem] transition-colors group-hover:text-violet md:text-[1.625rem]`}>{c.title}</span>
                </Link>
              </li>
            ))}
          </ul>
          <h3 className={`${H2} mt-10 mb-4 text-[1.25rem]`}>עוד אירועים ושירותים</h3>
          <More />
        </div>
      </section>
    </>
  );
}

/* ——— B : fond de nuit, photos pleine largeur, accents fluo du logo ——— */
function B() {
  return (
    <div className="on-dark bg-night text-white">
      <section className="wrap pt-10 pb-8 md:pt-14">
        <p className="font-[family-name:var(--font-display)] font-bold text-neon-lime">קומי קומי הפקות</p>
        <h1 className={`${H2} mt-2 max-w-4xl text-[2.25rem] md:text-[3.75rem]`}>
          הפקות בר ובת מצווה, <span className="text-neon-pink">ימי הולדת</span> ואירועים לילדים ולנוער
        </h1>
        <p className="mt-4 max-w-2xl text-[1.1875rem] text-white/85">{SUB}</p>
        <div className="mt-7">
          <Cta dark />
        </div>
      </section>
      <section className="wrap space-y-5 pb-6">
        {MAIN.map((m, i) => (
          <Link key={m.href} href={m.href} className="group relative block overflow-hidden rounded-[28px]">
            <Slideshow slides={m.img} delay={i * 1800} alt={m.title} ratio="21 / 9" priority sizes="(min-width: 768px) 1200px, 92vw" className="!rounded-none max-md:![aspect-ratio:4/3]" />
            <div className={`absolute inset-y-0 start-0 flex w-full flex-col justify-end bg-night/70 p-6 md:w-[46%] md:justify-center md:p-10`}>
              <h2 className={`${H2} text-[2rem] md:text-[3rem] ${i ? "text-neon-pink" : "text-neon-lime"}`}>{m.title}</h2>
              <p className="mt-2 text-[1.0625rem] text-white/90">{m.text}</p>
              <Click className={`mt-5 self-start text-ink transition-colors group-hover:bg-white ${i ? "bg-neon-pink" : "bg-neon-lime"}`} />
            </div>
          </Link>
        ))}
      </section>
      <section className="wrap grid gap-5 py-10 md:grid-cols-2">
        {KIDS.map((k, i) => (
          <Link key={k.href} href={k.href} className="group relative block overflow-hidden rounded-[28px]">
            <Slideshow slides={k.img} alt={k.title} ratio="4 / 3" sizes="(min-width: 768px) 600px, 92vw" className="!rounded-none" />
            <div className="absolute inset-x-0 bottom-0 bg-night/80 p-5 md:p-7">
              <div className="flex items-center gap-3">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-ink ${i ? "bg-neon-pink" : "bg-[#4dfdf3]"}`}>
                  <k.Icon />
                </span>
                <h2 className={`${H2} text-[1.5rem] md:text-[2rem]`}>{k.title}</h2>
              </div>
              <p className="mt-2 font-bold text-neon-lime">{AGES}</p>
              <Click className="mt-2 !min-h-0 !px-0 text-white group-hover:text-neon-lime" />
            </div>
          </Link>
        ))}
      </section>
      <section className="wrap pb-16">
        <h2 className={`${H2} text-[1.875rem] md:text-[2.5rem]`}>כל הקטגוריות</h2>
        <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATS.map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="group relative block overflow-hidden rounded-[20px]">
                <Slideshow slides={c.img} delay={900} alt={c.title} ratio="3 / 4" sizes="(min-width: 768px) 290px, 46vw" className="!rounded-none" />
                <span className={`${H2} absolute inset-x-0 bottom-0 bg-night/80 px-4 py-3 text-[1.25rem] transition-colors group-hover:text-neon-lime md:text-[1.5rem]`}>{c.title}</span>
              </Link>
            </li>
          ))}
        </ul>
        <h3 className={`${H2} mt-10 mb-4 text-[1.25rem]`}>עוד אירועים ושירותים</h3>
        <More dark />
      </section>
    </div>
  );
}

/* ——— C : aplats de couleur du logo, photos en « taches » arrondies, étiquettes inclinées ——— */
function C() {
  const tone = ["bg-pink", "bg-[#4dfdf3]"];
  const kid = ["bg-[#ceff4c]", "bg-sun"];
  const cat = ["bg-sun", "bg-pink", "bg-[#4dfdf3]", "bg-[#ceff4c]"];
  return (
    <>
      <section className="wrap pt-10 pb-8 text-center md:pt-14">
        <h1 className={`${H2} mx-auto max-w-4xl text-[2.25rem] md:text-[3.75rem]`}>{TITLE}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-[1.1875rem] font-medium">{SUB}</p>
        <div className="mt-7 flex justify-center">
          <Cta />
        </div>
      </section>
      <section className="wrap grid gap-5 pb-6 md:grid-cols-2">
        {MAIN.map((m, i) => (
          <Link key={m.href} href={m.href} className={`group relative block rounded-[36px] ${tone[i]} p-6 md:p-9`}>
            <span className="absolute end-6 top-6 z-10 -rotate-6 rounded-full bg-ink px-4 py-2 font-[family-name:var(--font-display)] text-[0.9375rem] font-bold text-white">{m.text}</span>
            <Slideshow slides={m.img} delay={i * 1800} alt={m.title} ratio="4 / 3" priority sizes="(min-width: 768px) 540px, 86vw" className="!rounded-[30%_26%_32%_24%]" />
            <h2 className={`${H2} mt-6 text-[2rem] md:text-[2.75rem]`}>{m.title}</h2>
            <Click className="mt-4 bg-ink text-white transition-colors group-hover:bg-white group-hover:text-ink" />
          </Link>
        ))}
      </section>
      <section className="wrap grid gap-5 py-10 md:grid-cols-2">
        {KIDS.map((k, i) => (
          <Link key={k.href} href={k.href} className={`group flex items-center gap-5 rounded-[36px] ${kid[i]} p-5 md:p-7`}>
            <div className="w-2/5 shrink-0">
              <Slideshow slides={k.img} alt={k.title} ratio="1 / 1" sizes="(min-width: 768px) 220px, 36vw" className="!rounded-[32%]" />
            </div>
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-pink-ink">
                <k.Icon />
              </span>
              <h2 className={`${H2} mt-3 text-[1.5rem] md:text-[2rem]`}>{k.title}</h2>
              <p className="mt-1 font-bold">{AGES}</p>
              <Click className="mt-3 bg-ink !px-5 text-white transition-colors group-hover:bg-white group-hover:text-ink" />
            </div>
          </Link>
        ))}
      </section>
      <section className="wrap pb-16">
        <h2 className={`${H2} text-center text-[1.875rem] md:text-[2.5rem]`}>כל הקטגוריות</h2>
        <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATS.map((c, i) => (
            <li key={c.href}>
              <Link href={c.href} className={`group block rounded-[28px] ${cat[i]} p-4 text-center`}>
                <Slideshow slides={c.img} delay={900} alt={c.title} ratio="1 / 1" sizes="(min-width: 768px) 260px, 40vw" className="!rounded-[32%]" />
                <span className={`${H2} mt-3 block text-[1.375rem] md:text-[1.625rem]`}>{c.title}</span>
              </Link>
            </li>
          ))}
        </ul>
        <h3 className={`${H2} mt-10 mb-4 text-center text-[1.25rem]`}>עוד אירועים ושירותים</h3>
        <div className="flex justify-center">
          <More />
        </div>
      </section>
    </>
  );
}

export default async function Maquette({ params }: Props) {
  const { v } = await params;
  if (!VARIANTS.includes(v as V)) notFound();
  const names: Record<V, string> = { a: "A · באנרים גדולים", b: "B · כהה וזוהר", c: "C · צבעוני ושמח" };
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
      {v === "a" ? <A /> : v === "b" ? <B /> : <C />}
    </>
  );
}
