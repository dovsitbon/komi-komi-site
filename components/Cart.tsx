"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CheckIcon, PlusIcon } from "@/components/icons";
import he from "@/locales/he.json";

/** « Panier » de devis : les prestations ajoutées depuis le catalogue, gardées dans le navigateur (localStorage). */
const KEY = "komi-quote";
type Ctx = { items: string[]; has: (id: string) => boolean; toggle: (id: string) => void; add: (id: string) => void; clear: () => void; ready: boolean };
const CartCtx = createContext<Ctx>({ items: [], has: () => false, toggle: () => {}, add: () => {}, clear: () => {}, ready: false });
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique du navigateur après l'hydratation
      if (Array.isArray(saved)) setItems(saved.filter((x) => typeof x === "string"));
    } catch {}
    setReady(true);
  }, []);

  const save = useCallback((next: string[]) => {
    setItems(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      items,
      ready,
      has: (id) => items.includes(id),
      toggle: (id) => save(items.includes(id) ? items.filter((x) => x !== id) : [...items, id]),
      add: (id) => {
        if (!items.includes(id)) save([...items, id]);
      },
      clear: () => save([]),
    }),
    [items, ready, save],
  );
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

/** Bouton « הוסיפו להצעת המחיר » d'une carte du catalogue. */
export function AddToQuote({ id, name, className = "" }: { id: string; name: string; className?: string }) {
  const { has, toggle } = useCart();
  const on = has(id);
  return (
    <button type="button" onClick={() => toggle(id)} aria-pressed={on} aria-label={`${on ? he.common.remove : he.common.add}: ${name}`} className={`btn btn-sm ${on ? "bg-violet text-white" : "btn-ghost"} ${className}`}>
      {on ? <CheckIcon /> : <PlusIcon />}
      {on ? he.common.added : he.common.add}
    </button>
  );
}

/** Pastille du nombre de prestations dans la demande (en-tête). */
export function CartCount({ className = "" }: { className?: string }) {
  const { items, ready } = useCart();
  if (!ready || !items.length) return null;
  return (
    <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[0.75rem] font-bold text-white tabular-nums ${className}`}>
      <span className="sr-only">{he.cart.count}: </span>
      {items.length}
    </span>
  );
}
