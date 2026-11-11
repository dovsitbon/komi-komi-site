import Link from "next/link";
import { CartCount } from "@/components/Cart";
import { WhatsAppIcon } from "@/components/icons";
import { waLink } from "@/lib/site";
import he from "@/locales/he.json";

/** Barre fixée en bas sur mobile : devis + WhatsApp toujours sous le pouce. */
export function MobileBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex gap-2 px-3 py-2">
        <Link href="/quote" className="btn btn-primary min-w-0 flex-[1.6] !px-3">
          {he.common.quote}
          <CartCount />
        </Link>
        <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost min-w-0 flex-1 !px-3">
          <WhatsAppIcon className="text-[#128c7e]" />
          {he.common.whatsapp}
        </a>
      </div>
    </div>
  );
}
