import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import annonce from "@/data/annonces.json";
import { AnnounceBar } from "@/components/AnnounceBar";
import { CartProvider } from "@/components/Cart";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Intro } from "@/components/Intro";
import { JsonLd } from "@/components/JsonLd";
import { MobileBar } from "@/components/MobileBar";
import { businessJsonLd } from "@/lib/jsonld";
import { NAV } from "@/lib/nav";
import { site, telHref, waLink } from "@/lib/site";
import he from "@/locales/he.json";

// Polices servies en local (app/fonts) : aucun appel à Google Fonts
const rubik = localFont({
  src: [
    { path: "./fonts/rubik-hebrew-500-normal.woff2", weight: "500" },
    { path: "./fonts/rubik-hebrew-700-normal.woff2", weight: "700" },
    { path: "./fonts/rubik-hebrew-800-normal.woff2", weight: "800" },
    { path: "./fonts/rubik-latin-500-normal.woff2", weight: "500" },
    { path: "./fonts/rubik-latin-700-normal.woff2", weight: "700" },
    { path: "./fonts/rubik-latin-800-normal.woff2", weight: "800" },
  ],
  variable: "--font-rubik",
  display: "swap",
});
const heebo = localFont({
  src: [
    { path: "./fonts/heebo-hebrew-400-normal.woff2", weight: "400" },
    { path: "./fonts/heebo-hebrew-500-normal.woff2", weight: "500" },
    { path: "./fonts/heebo-hebrew-700-normal.woff2", weight: "700" },
    { path: "./fonts/heebo-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/heebo-latin-500-normal.woff2", weight: "500" },
    { path: "./fonts/heebo-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: he.meta.title,
  description: he.meta.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.nameHe,
    title: he.meta.title,
    description: he.meta.description,
    locale: "he_IL",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: he.meta.ogAlt }],
  },
  twitter: { card: "summary_large_image", title: he.meta.title, description: he.meta.description, images: ["/og.jpg"] },
  formatDetection: { telephone: false },
  // Aucun navigateur ne doit proposer sa traduction automatique
  other: { google: "notranslate" },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

const introScript = `document.documentElement.classList.add("js");try{if(sessionStorage.getItem("komi-intro")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("intro-seen")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" translate="no" className={`${rubik.variable} ${heebo.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body className="notranslate">
        <CartProvider>
          <Intro />
          <AnnounceBar annonce={annonce} />
          <Header nav={NAV} phone={{ label: site.phones[0].label, href: telHref(0) }} whatsapp={waLink()} />
          <main id="main">{children}</main>
          <Footer />
          <MobileBar />
        </CartProvider>
        <JsonLd data={businessJsonLd()} />
      </body>
    </html>
  );
}
