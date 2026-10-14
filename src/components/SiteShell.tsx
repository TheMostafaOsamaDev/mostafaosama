import type { ReactNode } from "react";
import { RootDocument } from "@/components/RootDocument";
import { LazySiteNav } from "@/components/site-nav/LazySiteNav";
import { buttonSettings } from "@/components/ui/button-settings";
import { ButtonEffects } from "@/components/ui/ButtonEffects";
import { DIR, type Locale } from "@/i18n/config";

/**
 * A language's site: the document, the page, and the nav. Each language has its own root layout (app/(en),
 * app/ar) so each preloads only its own fonts; this is what they share.
 */
export function SiteShell({ locale, fontClass, children }: { locale: Locale; fontClass: string; children: ReactNode }) {
  return (
    <RootDocument lang={locale} dir={DIR[locale]} fontClass={fontClass}>
      {children}
      {/* The nav lives in the layout, so it stays mounted (and keeps its state) while the page changes. */}
      <LazySiteNav locale={locale} />
      {/* Magnetic buttons: one shared pointer listener (off when the strength is 0). */}
      {(buttonSettings.strength > 0 || buttonSettings.fill !== "none") && <ButtonEffects />}
    </RootDocument>
  );
}
