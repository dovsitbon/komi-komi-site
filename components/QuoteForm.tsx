"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { useCart } from "@/components/Cart";
import { WhatsAppIcon } from "@/components/icons";
import { EVENT_TYPES, VENUES, isPhone, isoToday, quoteMailto, quoteWaLink, takenDates, type EventType, type QuoteRequest, type Venue } from "@/lib/quote";
import he from "@/locales/he.json";

type Item = { id: string; name: string; cat: string };
type Props = { prestations: Item[]; cats: Record<string, string>; themes: string[]; hasEmail: boolean };

const EMPTY: QuoteRequest = { type: "", date: "", time: "", city: "", venue: "", ages: "", guests: "", prestations: [], theme: "", budget: "", name: "", phone: "", message: "" };

/**
 * Formulaire de devis : type d'événement, date, heure, ville, lieu, âge, invités, prestations (pré-cochées depuis le
 * « panier » du catalogue), thème, budget, nom, téléphone, message. Envoi : récapitulatif formaté sur WhatsApp.
 */
export function QuoteForm({ prestations, cats, themes, hasEmail }: Props) {
  const q = he.quote;
  const uid = useId();
  const params = useSearchParams();
  const cart = useCart();
  const [r, setR] = useState<QuoteRequest>(EMPTY);
  const [errors, setErrors] = useState<{ type?: string; name?: string; phone?: string }>({});
  const [sent, setSent] = useState(false);
  const [today, setToday] = useState("");
  const names = useMemo(() => Object.fromEntries(prestations.map((p) => [p.id, p.name])), [prestations]);
  const set = <K extends keyof QuoteRequest>(k: K, v: QuoteRequest[K]) => setR((prev) => ({ ...prev, [k]: v }));

  // Pré-remplissage depuis le hero (?type=&kids=), une carte (?add=) ou une page de thème (?theme=)
  useEffect(() => {
    const type = params.get("type") || "";
    const add = params.get("add");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- valeurs lues dans l'URL après l'hydratation
    setToday(isoToday());
    setR((prev) => ({
      ...prev,
      type: (EVENT_TYPES as readonly string[]).includes(type) ? (type as EventType) : prev.type,
      guests: params.get("kids") || prev.guests,
      theme: params.get("theme") || prev.theme,
    }));
    if (add && names[add]) cart.add(add);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une seule fois à l'arrivée sur la page
  }, [params, names]);

  // Les prestations du « panier » sont celles du formulaire
  const selected = cart.items.filter((id) => names[id]);
  const request = { ...r, prestations: selected };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (!r.type) err.type = q.errors.type;
    if (!r.name.trim()) err.name = q.errors.name;
    if (!isPhone(r.phone)) err.phone = q.errors.phone;
    setErrors(err);
    const first = Object.keys(err)[0];
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    window.open(quoteWaLink(request, names), "_blank", "noopener");
    setSent(true);
  };

  if (sent) {
    return (
      <div className="card p-6 md:p-10" role="status">
        <h2 className="h-display text-[1.75rem]">{q.success.title}</h2>
        <p className="mt-3 text-muted">{q.success.text}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={quoteWaLink(request, names)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            <WhatsAppIcon />
            {q.success.again}
          </a>
          {hasEmail && (
            <a href={quoteMailto(request, names)} className="btn btn-ghost">
              {q.success.mail}
            </a>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setR(EMPTY);
              cart.clear();
              setSent(false);
            }}
          >
            {q.success.reset}
          </button>
        </div>
        {/* Paiement d’acompte en ligne : prévu dans lib/payment.ts (désactivé) ; le bouton s’ajoutera ici */}
      </div>
    );
  }

  const groups = Object.entries(cats).map(([cat, label]) => ({ label, items: prestations.filter((p) => p.cat === cat) }));
  const opt = <span className="font-normal text-muted"> · {q.optional}</span>;

  return (
    <form onSubmit={submit} noValidate className="space-y-10">
      <fieldset className="card p-5 md:p-8">
        <legend className="eyebrow float-start mb-5 w-full">1 · {q.steps.event}</legend>
        <div className="clear-both grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor={`${uid}-type`} className="label">
              {q.type}
            </label>
            <select id={`${uid}-type`} name="type" className="field" value={r.type} onChange={(e) => set("type", e.target.value as EventType)} aria-invalid={!!errors.type} aria-describedby={errors.type ? `${uid}-type-err` : undefined} required>
              <option value="">{he.hero.typePlaceholder}</option>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {q.types[t]}
                </option>
              ))}
            </select>
            {errors.type && (
              <p id={`${uid}-type-err`} className="err" role="alert">
                {errors.type}
              </p>
            )}
          </div>
          <div>
            <label htmlFor={`${uid}-date`} className="label">
              {q.date}
              {opt}
            </label>
            <input id={`${uid}-date`} name="date" type="date" className="field" min={today || undefined} value={r.date} onChange={(e) => set("date", e.target.value)} aria-describedby={r.date && takenDates.has(r.date) ? `${uid}-date-note` : undefined} />
            {r.date && takenDates.has(r.date) && (
              <p id={`${uid}-date-note`} className="mt-2 text-[0.875rem] text-pink-ink" role="status">
                {q.dateTaken}
              </p>
            )}
          </div>
          <div>
            <label htmlFor={`${uid}-time`} className="label">
              {q.time}
              {opt}
            </label>
            <input id={`${uid}-time`} name="time" type="time" className="field" value={r.time} onChange={(e) => set("time", e.target.value)} />
          </div>
          <div>
            <label htmlFor={`${uid}-city`} className="label">
              {q.city}
              {opt}
            </label>
            <input id={`${uid}-city`} name="city" type="text" className="field" autoComplete="address-level2" placeholder={q.cityPlaceholder} value={r.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div role="radiogroup" aria-labelledby={`${uid}-venue-label`}>
            <p id={`${uid}-venue-label`} className="label">
              {q.venue}
              {opt}
            </p>
            <div className="flex flex-wrap gap-2">
              {VENUES.map((v) => (
                <label key={v} className="chip">
                  <input type="radio" name="venue" className="sr-only" checked={r.venue === v} onChange={() => set("venue", v as Venue)} />
                  {q.venues[v]}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor={`${uid}-ages`} className="label">
              {q.ages}
              {opt}
            </label>
            <input id={`${uid}-ages`} name="ages" type="text" className="field" placeholder={q.agesPlaceholder} value={r.ages} onChange={(e) => set("ages", e.target.value)} />
          </div>
          <div>
            <label htmlFor={`${uid}-guests`} className="label">
              {q.guests}
              {opt}
            </label>
            <input id={`${uid}-guests`} name="guests" type="text" inputMode="text" className="field" placeholder={q.guestsPlaceholder} value={r.guests} onChange={(e) => set("guests", e.target.value)} />
          </div>
        </div>
      </fieldset>

      <fieldset className="card p-5 md:p-8">
        <legend className="eyebrow float-start mb-1 w-full">2 · {q.steps.prestations}</legend>
        <p className="clear-both mb-5 text-[0.9375rem] text-muted">{q.prestationsHint}</p>
        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g.label} role="group" aria-label={g.label}>
              <p className="mb-2 text-[0.875rem] font-medium text-muted">{g.label}</p>
              <div className="flex flex-wrap gap-2">
                {g.items.map((p) => (
                  <label key={p.id} className="chip">
                    <input type="checkbox" name="prestations" value={p.id} className="sr-only" checked={cart.has(p.id)} onChange={() => cart.toggle(p.id)} />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${uid}-theme`} className="label">
              {q.theme}
              {opt}
            </label>
            <input id={`${uid}-theme`} name="theme" type="text" list={`${uid}-themes`} className="field" placeholder={q.themePlaceholder} value={r.theme} onChange={(e) => set("theme", e.target.value)} />
            <datalist id={`${uid}-themes`}>
              {themes.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor={`${uid}-budget`} className="label">
              {q.budget}
              {opt}
            </label>
            <input id={`${uid}-budget`} name="budget" type="text" inputMode="numeric" className="field" placeholder={q.budgetPlaceholder} value={r.budget} onChange={(e) => set("budget", e.target.value)} />
          </div>
        </div>
      </fieldset>

      <fieldset className="card p-5 md:p-8">
        <legend className="eyebrow float-start mb-5 w-full">3 · {q.steps.contact}</legend>
        <div className="clear-both grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${uid}-name`} className="label">
              {q.name}
            </label>
            <input id={`${uid}-name`} name="name" type="text" className="field" autoComplete="name" value={r.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${uid}-name-err` : undefined} required />
            {errors.name && (
              <p id={`${uid}-name-err`} className="err" role="alert">
                {errors.name}
              </p>
            )}
          </div>
          <div>
            <label htmlFor={`${uid}-phone`} className="label">
              {q.phone}
            </label>
            <input id={`${uid}-phone`} name="phone" type="tel" dir="ltr" className="field text-end" autoComplete="tel" inputMode="tel" value={r.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${uid}-phone-err` : undefined} required />
            {errors.phone && (
              <p id={`${uid}-phone-err`} className="err" role="alert">
                {errors.phone}
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={`${uid}-message`} className="label">
              {q.messageLabel}
              {opt}
            </label>
            <textarea id={`${uid}-message`} name="message" rows={4} className="field resize-y" value={r.message} onChange={(e) => set("message", e.target.value)} />
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" className="btn btn-primary">
            <WhatsAppIcon />
            {q.submit}
          </button>
          <p className="text-[0.875rem] text-muted">{q.hint}</p>
        </div>
      </fieldset>
    </form>
  );
}
