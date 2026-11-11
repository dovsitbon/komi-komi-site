import calendar from "@/data/dates.json";
import site from "@/data/site.json";
import he from "@/locales/he.json";

export const EVENT_TYPES = ["bar-mitzvah", "bat-mitzvah", "birthday", "full-moon", "purim", "corporate", "brit", "other"] as const;
export type EventType = (typeof EVENT_TYPES)[number];
export const VENUES = ["home", "hall", "garden"] as const;
export type Venue = (typeof VENUES)[number];
export const KIDS_RANGES = ["עד 15", "15–30", "30–60", "60–100", "מעל 100"] as const;

export const takenDates = new Set<string>(calendar.taken as string[]);
export const isPhone = (v: string) => /^[+\d][\d\s\-().]{7,19}$/.test(v.trim());

export function formatDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}
/** Date du jour au format AAAA-MM-JJ, en heure d'Israël. */
export function isoToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export type QuoteRequest = {
  type: EventType | "";
  date: string;
  time: string;
  city: string;
  venue: Venue | "";
  ages: string;
  guests: string;
  prestations: string[];
  theme: string;
  budget: string;
  name: string;
  phone: string;
  message: string;
};

/** Récapitulatif de la demande de devis, envoyé sur WhatsApp. `names` : libellé de chaque prestation (id → nom). */
export function quoteMessage(r: QuoteRequest, names: Record<string, string> = {}) {
  const m = he.quote.message;
  const f = he.quote;
  const line = (label: string, value: string) => (value ? `${label}: ${value}` : "");
  const blocks = [
    [`*${m.title}*`],
    [
      line(m.type, r.type ? f.types[r.type] : ""),
      line(m.date, r.date ? formatDay(r.date) : ""),
      line(m.time, r.time),
      line(m.city, r.city),
      line(m.venue, r.venue ? f.venues[r.venue] : ""),
      line(m.ages, r.ages),
      line(m.guests, r.guests),
    ],
    r.prestations.length ? [`${m.prestations}:`, ...r.prestations.map((id) => `• ${names[id] || id}`)] : [],
    [line(m.theme, r.theme), line(m.budget, r.budget)],
    [line(m.name, r.name), line(m.phone, r.phone), line(m.note, r.message)],
    [m.closing],
  ];
  return blocks.map((b) => b.filter(Boolean).join("\n")).filter(Boolean).join("\n\n");
}

export const quoteWaLink = (r: QuoteRequest, names?: Record<string, string>) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(quoteMessage(r, names))}`;
export const quoteMailto = (r: QuoteRequest, names?: Record<string, string>) => (site.email ? `mailto:${site.email}?subject=${encodeURIComponent(he.quote.message.title)}&body=${encodeURIComponent(quoteMessage(r, names).split("*").join(""))}` : "");

/** Lien vers le formulaire, avec type d'événement, nombre d'enfants ou prestation pré-remplis. */
export function quoteHref(o: { type?: string; kids?: string; add?: string; theme?: string } = {}) {
  const q = new URLSearchParams();
  if (o.type) q.set("type", o.type);
  if (o.kids) q.set("kids", o.kids);
  if (o.add) q.set("add", o.add);
  if (o.theme) q.set("theme", o.theme);
  const s = q.toString();
  return `/quote${s ? `?${s}` : ""}`;
}
