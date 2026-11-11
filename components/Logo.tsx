import { Balloon } from "@/components/icons";

/**
 * Logo typographique : « קומי קומי » en Rubik très gras, « הפקות אירועים » en petit, et un ballon au trait.
 * (Le logo de l'ancien site est trop pixellisé pour être repris tel quel.)
 */
export function Logo({ light = false, small = false }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" translate="no">
      <Balloon className={small ? "h-9 w-5" : "h-11 w-6"} color="var(--color-pink)" />
      <span className="flex flex-col leading-none">
        <span className={`font-[family-name:var(--font-display)] font-extrabold ${small ? "text-[1.375rem]" : "text-[1.625rem]"} ${light ? "text-white" : "text-violet"}`}>קומי קומי</span>
        <span className={`mt-1 font-[family-name:var(--font-display)] text-[0.75rem] font-medium ${light ? "text-white/80" : "text-muted"}`}>הפקות אירועים</span>
      </span>
    </span>
  );
}
