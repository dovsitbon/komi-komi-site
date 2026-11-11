"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CartCount } from "@/components/Cart";
import { Logo } from "@/components/Logo";
import { ChevronIcon, CloseIcon, MenuIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import type { NavGroup } from "@/lib/nav";
import he from "@/locales/he.json";

type Props = { nav: NavGroup[]; phone: { label: string; href: string }; whatsapp: string };

/** En-tête fixe : logo, méga-menu (ordinateur) ou tiroir (mobile), téléphone, WhatsApp et bouton de devis toujours visibles. */
export function Header({ nav, phone, whatsapp }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState<number | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [section, setSection] = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null);

  // Ferme tout au changement de page
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- remise à zéro liée à la navigation
    setOpen(null);
    setDrawer(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setDrawer(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  // Tiroir ouvert : la page derrière ne défile plus et sort de l'ordre de tabulation
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    const behind = [document.getElementById("main"), document.querySelector("footer")];
    behind.forEach((el) => el?.toggleAttribute("inert", drawer));
    return () => {
      document.body.style.overflow = "";
      behind.forEach((el) => el?.removeAttribute("inert"));
    };
  }, [drawer]);

  const isActive = (g: NavGroup) => pathname === g.href || pathname.startsWith(g.href + "/");

  return (
    <header ref={ref} className="sticky top-0 z-50 border-b border-line bg-white">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-10 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        {he.common.skip}
      </a>
      <div className="wrap flex h-16 items-center justify-between gap-4 md:h-20">
        <Link href="/" aria-label={`קומי קומי הפקות אירועים – ${he.common.home}`} className="shrink-0">
          <Logo small />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <a href={phone.href} className="nav-link hidden min-h-11 items-center gap-2 px-2 whitespace-nowrap tabular-nums transition-colors hover:text-violet sm:inline-flex" dir="ltr">
            <PhoneIcon width={18} height={18} />
            {phone.label}
          </a>
          <a href={phone.href} aria-label={`${he.common.call} ${phone.label}`} className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-violet-soft sm:hidden">
            <PhoneIcon />
          </a>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label={he.common.whatsapp} className="hidden h-11 w-11 items-center justify-center rounded-full text-[#128c7e] transition-colors hover:bg-violet-soft sm:inline-flex">
            <WhatsAppIcon width={22} height={22} />
          </a>
          <Link href="/quote" className="btn btn-primary btn-sm hidden min-[420px]:inline-flex">
            <span className="sm:hidden">{he.common.quoteShort}</span>
            <span className="hidden sm:inline">{he.common.quote}</span>
            <CartCount />
          </Link>
          <button type="button" aria-label={he.common.menu} aria-expanded={drawer} aria-controls="drawer" onClick={() => setDrawer(true)} className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-violet-soft min-[1180px]:hidden">
            <MenuIcon />
          </button>
        </div>
      </div>

        <nav aria-label={he.common.menu} className="hidden border-t border-line min-[1180px]:block">
        <div className="wrap">
          <ul className="-mx-3 flex h-12 items-center justify-between">
            {nav.map((g, i) => (
              <li key={g.href}>
                {g.columns ? (
                  <button
                    type="button"
                    aria-expanded={open === i}
                    aria-controls={`mega-${i}`}
                    onClick={() => setOpen(open === i ? null : i)}
                    className={`nav-link inline-flex min-h-11 items-center gap-1 rounded-full px-3 whitespace-nowrap transition-colors hover:bg-violet-soft ${open === i || isActive(g) ? "text-violet" : ""}`}
                  >
                    {g.label}
                    <ChevronIcon className={`transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <Link href={g.href} aria-current={pathname === g.href ? "page" : undefined} className={`nav-link inline-flex min-h-11 items-center rounded-full px-3 whitespace-nowrap transition-colors hover:bg-violet-soft ${isActive(g) ? "text-violet" : ""}`}>
                    {g.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>


      {/* Méga-menu */}
      {nav.map((g, i) =>
        g.columns ? (
          <div key={g.href} id={`mega-${i}`} hidden={open !== i} className="absolute inset-x-0 top-full hidden border-b border-line bg-white shadow-[0_12px_24px_-16px_rgb(36_33_43/0.25)] min-[1180px]:block">
            <div className="wrap flex gap-12 py-8">
              {g.columns.map((c, j) => (
                <div key={j} className="min-w-44">
                  {c.title && <p className="eyebrow mb-3">{c.title}</p>}
                  <ul className="space-y-1">
                    {c.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} aria-current={pathname === l.href ? "page" : undefined} className="-mx-2 flex min-h-9 items-center rounded-lg px-2 text-[0.9375rem] transition-colors hover:bg-violet-soft hover:text-violet">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null,
      )}

      {/* Tiroir mobile */}
      {drawer && (
        <div id="drawer" role="dialog" aria-modal="true" aria-label={he.common.menu} className="fixed inset-0 z-[60] flex flex-col overflow-y-auto overscroll-contain bg-white min-[1180px]:hidden">
          <div className="wrap flex h-16 shrink-0 items-center justify-between border-b border-line md:h-20">
            <Logo small />
            <button type="button" aria-label={he.common.close} onClick={() => setDrawer(false)} autoFocus className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-violet-soft">
              <CloseIcon />
            </button>
          </div>
          <ul className="wrap flex-1 py-2">
            {nav.map((g, i) => (
              <li key={g.href} className="border-b border-line">
                {g.columns ? (
                  <>
                    <button type="button" aria-expanded={section === i} onClick={() => setSection(section === i ? null : i)} className="flex min-h-14 w-full items-center justify-between font-[family-name:var(--font-display)] text-[1.125rem] font-medium">
                      {g.label}
                      <ChevronIcon className={`transition-transform duration-200 ${section === i ? "rotate-180" : ""}`} />
                    </button>
                    {section === i && (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-4 pb-5">
                        {g.columns.map((c, j) => (
                          <div key={j}>
                            {c.title && <p className="eyebrow mb-1">{c.title}</p>}
                            <ul>
                              {c.links.map((l) => (
                                <li key={l.href}>
                                  <Link href={l.href} className="flex min-h-10 items-center text-[0.9375rem] text-muted hover:text-violet">
                                    {l.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={g.href} className="flex min-h-14 items-center font-[family-name:var(--font-display)] text-[1.125rem] font-medium">
                    {g.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className="wrap flex shrink-0 flex-col gap-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
            <Link href="/quote" className="btn btn-primary">
              {he.common.quote}
            </Link>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <WhatsAppIcon />
              {he.common.whatsapp}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
