"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Balloon } from "@/components/icons";
import he from "@/locales/he.json";

const KEY = "komi-intro";
const TOTAL = 1.2;

// Confettis : position horizontale (%), départ (s), largeur, couleur, rotation finale, hauteur d'arrivée (vh)
const CONFETTI = [
  [10, 0.0, 10, "var(--color-pink)", 140, 34],
  [22, 0.08, 8, "var(--color-sun)", -120, 52],
  [34, 0.02, 12, "var(--color-teal)", 200, 26],
  [46, 0.12, 8, "var(--color-violet)", -160, 60],
  [58, 0.05, 10, "var(--color-sun)", 180, 30],
  [70, 0.1, 12, "var(--color-pink)", -200, 48],
  [82, 0.03, 8, "var(--color-teal)", 120, 38],
  [92, 0.14, 10, "var(--color-violet)", -140, 56],
] as const;

const markSeen = () => {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {}
  document.documentElement.classList.add("intro-seen");
};

/**
 * Ouverture (1,2 s, une fois par session, aucun son) : fond blanc → quelques confettis et un ballon montent →
 * « קומי קומי » rebondit doucement, puis « הפקות אירועים » → fondu sur le hero.
 * Masquée d'office si le visiteur réduit les animations (script du layout + globals.css). Bouton « דלג ».
 */
export function Intro() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      markSeen();
      setGone(true);
    }, TOTAL * 1000);
    return () => clearTimeout(t);
  }, []);

  if (gone) return null;

  return (
    <motion.div className="intro-curtain flex items-center justify-center" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 0.95, duration: 0.25, ease: "easeOut" }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {CONFETTI.map(([x, delay, w, color, rot, top], i) => (
          <motion.span
            key={i}
            className="absolute block rounded-[2px]"
            style={{ left: `${x}%`, bottom: 0, width: w, height: w * 0.45, background: color }}
            initial={{ y: 20, opacity: 0, rotate: 0 }}
            animate={{ y: `-${100 - top}vh`, opacity: [0, 1, 1, 0.9], rotate: rot }}
            transition={{ delay, duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
          />
        ))}
        <motion.div className="absolute start-[14%] bottom-0" initial={{ y: 90 }} animate={{ y: "-58vh" }} transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}>
          <Balloon className="h-24 w-14" color="var(--color-sun)" />
        </motion.div>
      </div>

      <div className="relative text-center" translate="no">
        <motion.p
          className="font-[family-name:var(--font-display)] text-[3.5rem] leading-none font-extrabold text-violet md:text-[5rem]"
          initial={{ y: 18, opacity: 0, scale: 0.96 }}
          animate={{ y: [18, -8, 0], opacity: 1, scale: [0.96, 1.03, 1] }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut", times: [0, 0.6, 1] }}
        >
          קומי קומי
        </motion.p>
        <motion.p className="mt-3 font-[family-name:var(--font-display)] text-[1.25rem] font-medium text-muted" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.25, ease: "easeOut" }}>
          {he.intro.sub}
        </motion.p>
      </div>

      <button
        type="button"
        onClick={() => {
          markSeen();
          setGone(true);
        }}
        className="absolute end-4 bottom-4 z-10 inline-flex min-h-11 items-center rounded-full px-5 font-[family-name:var(--font-display)] font-medium text-muted transition-colors hover:bg-violet-soft hover:text-ink"
      >
        {he.intro.skip}
      </button>
    </motion.div>
  );
}
