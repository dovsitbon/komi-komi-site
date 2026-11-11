import Link from "next/link";
import { StringLine } from "@/components/icons";
import he from "@/locales/he.json";

const links = [
  ["/bar-mitzvah", "בר מצווה"],
  ["/bat-mitzvah", "בת מצווה"],
  ["/birthdays", "ימי הולדת"],
  ["/clowns", "ליצנים"],
  ["/candy-bar", "בר מתוקים"],
  ["/purim", "פורים"],
  ["/catalog", "קטלוג"],
  ["/contact", "צרו קשר"],
];

export default function NotFound() {
  const n = he.notFound;
  return (
    <section className="wrap py-20 md:py-28">
      <h1 className="h-display text-[2.25rem] md:text-[3.25rem]">{n.title}</h1>
      <StringLine />
      <p className="lead mt-6">{n.text}</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="chip">
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/" className="btn btn-primary mt-8">
        {n.home}
      </Link>
    </section>
  );
}
