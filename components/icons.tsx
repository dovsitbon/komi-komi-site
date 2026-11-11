import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const PhoneIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);
export const WhatsAppIcon = (p: P) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5.1 5.2-1.4A9.9 9.9 0 1 0 12.04 2m0 1.8a8.1 8.1 0 0 1 6.9 12.4 8.1 8.1 0 0 1-10.9 2.7l-.4-.2-3.1.8.8-3-.2-.4A8.1 8.1 0 0 1 12.04 3.800M8.5 7.200c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.300s1 2.700 1.200 2.900c.1.2 2 3.100 4.900 4.300 2.400 1 2.900.8 3.400.7.500 0 1.700-.7 1.900-1.300.2-.700.2-1.200.2-1.300-.1-.200-.300-.200-.600-.400l-2-1c-.300-.100-.500-.100-.700.200l-.900 1.100c-.200.200-.300.200-.600.100a6.600 6.600 0 0 1-3.300-2.900c-.200-.400.300-.400.700-1.300.1-.200 0-.400 0-.500l-1-2.300c-.200-.600-.500-.500-.700-.500z" />
  </svg>
);
export const MenuIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const ChevronIcon = (p: P) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
/** Flèche « continuer » : pointe vers la gauche en hébreu (sens de lecture). */
export const ArrowIcon = (p: P) => (
  <svg {...base} width={18} height={18} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
export const CheckIcon = (p: P) => (
  <svg {...base} width={18} height={18} strokeWidth={2.25} {...p}>
    <path d="m5 12.5 4.500 4.500L19 7.500" />
  </svg>
);
export const PlusIcon = (p: P) => (
  <svg {...base} width={18} height={18} strokeWidth={2.25} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const PlayIcon = (p: P) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M8 5.500v13l11-6.500z" />
  </svg>
);
export const FacebookIcon = (p: P) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M13.500 21v-7.500h2.600l.4-3h-3V8.600c0-.900.300-1.500 1.500-1.500h1.600V4.400a21 21 0 0 0-2.300-.1c-2.300 0-3.800 1.400-3.800 3.900v2.300H8v3h2.500V21z" />
  </svg>
);
export const InstagramIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3.500" y="3.500" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.200" cy="6.800" r="0.600" fill="currentColor" />
  </svg>
);
export const ListIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M8 6h12M8 12h12M8 18h12" />
    <path d="M4 6h.01M4 12h.01M4 18h.01" strokeWidth={2.500} />
  </svg>
);

/** Ficelle de ballon : trait ondulé, signature du site. */
export const StringLine = ({ className = "string" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 88 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true" preserveAspectRatio="none">
    <path d="M2 6c7-6 14-6 21 0s14 6 21 0 14-6 21 0 14 6 21 0" />
  </svg>
);

/** Ballon au trait (logo, ouverture). */
export const Balloon = ({ className, color = "var(--color-pink)" }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 40 72" fill="none" aria-hidden="true">
    <path d="M20 3c9.500 0 16 7.500 16 17 0 10-8 19-16 22C12 39 4 30 4 20 4 10.500 10.500 3 20 3Z" fill={color} stroke="var(--color-ink)" strokeWidth="2.500" strokeLinejoin="round" />
    <path d="M17 42.500 20 46l3-3.500" stroke="var(--color-ink)" strokeWidth="2.500" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 46c-4 6 4 9 0 14s2 7 0 10" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 16c1-4 4-6.500 7.500-7" stroke="#fff" strokeWidth="2.500" strokeLinecap="round" opacity="0.8" />
  </svg>
);

/** Quelques confettis au trait, posés dans un coin (décor discret). */
export const Confetti = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 120" fill="none" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <path d="M14 30l10-6" stroke="var(--color-pink)" />
    <path d="M52 12c4 2 6 6 4 10" stroke="var(--color-teal)" />
    <circle cx="92" cy="26" r="5" stroke="var(--color-sun)" />
    <path d="M24 78c5-3 10-1 12 4" stroke="var(--color-sun)" />
    <path d="M70 62l6 9" stroke="var(--color-violet)" />
    <circle cx="104" cy="84" r="4" stroke="var(--color-pink)" />
    <path d="M52 104l11-3" stroke="var(--color-teal)" />
    <path d="M12 108l3-9" stroke="var(--color-violet)" />
  </svg>
);
