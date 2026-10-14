"use client";

import { homeSettings } from "@/components/home/home";
import { navConfig } from "@/components/nav";
import type { Locale } from "@/i18n/config";
import { I18nProvider } from "@/i18n/I18nProvider";
import { FloatingNav } from "./FloatingNav";
import { usePageTransition } from "./usePageTransition";

/**
 * The site's navigation, as the owner chose it (src/components/nav.settings.json), in the page's language.
 * The site is one scrolling page, so page items jump to its sections and the marker follows the section being read.
 */
export function SiteNav({ locale }: { locale: Locale }) {
  usePageTransition(navConfig);
  return (
    <I18nProvider locale={locale}>
      <FloatingNav
        config={navConfig}
        base={locale === "en" ? "" : `/${locale}`}
        replay={0}
        sections
        revealAfter={homeSettings.navReveal}
      />
    </I18nProvider>
  );
}
