import type { Metadata } from "next";
import Link from "next/link";
import { StringLine } from "@/components/icons";
import { site } from "@/lib/site";
import he from "@/locales/he.json";

export const metadata: Metadata = { title: `${he.legal.title} | ${site.nameHe}`, alternates: { canonical: "/legal" }, robots: { index: false, follow: true } };

const sections = [
  { h: "מי אנחנו", p: `האתר מופעל על ידי ${site.nameHe}. ליצירת קשר: ${site.phones.map((x) => x.label).join(" או ")}.` },
  { h: "הצעות מחיר", p: "הפרטים שממלאים בטופס הצעת המחיר לא נשמרים באתר. הם נשלחים אלינו בהודעת וואטסאפ מהמכשיר שלכם, רק אחרי שלחצתם על שליחה. אנחנו משתמשים בהם אך ורק כדי לחזור אליכם עם הצעה." },
  { h: "מה נשמר בדפדפן", p: "האתר שומר בדפדפן שלכם את רשימת האטרקציות שהוספתם להצעת המחיר, ואת הבחירה לסגור את ההודעה שבראש העמוד. המידע הזה נשאר אצלכם ולא נשלח לשום שרת. האתר לא משתמש בעוגיות פרסום." },
  { h: "תמונות והמלצות", p: "התמונות באתר צולמו באירועים שהפקנו, וההמלצות נכתבו על ידי לקוחות בספר ההמלצות שלנו. מופיעים בתמונה או בהמלצה ורוצים שנסיר אותה? כתבו לנו ונסיר." },
  { h: "מחירים", p: "מחירים שמופיעים באתר הם מחירי התחלה, ועשויים להשתנות לפי האזור, התאריך וגודל האירוע. המחיר הקובע הוא זה שבהצעת המחיר שתקבלו." },
];

export default function LegalPage() {
  return (
    <section className="wrap max-w-3xl pt-10 pb-16 md:pt-14 md:pb-24">
      <h1 className="h-display text-[2.25rem] md:text-[3rem]">{he.legal.title}</h1>
      <StringLine />
      <div className="mt-8 space-y-8">
        {sections.map((s) => (
          <div key={s.h}>
            <h2 className="font-[family-name:var(--font-display)] text-[1.375rem] font-bold">{s.h}</h2>
            <p className="mt-2 text-muted">{s.p}</p>
          </div>
        ))}
      </div>
      <Link href="/" className="link mt-10 inline-flex min-h-11 items-center">
        {he.legal.back}
      </Link>
    </section>
  );
}
