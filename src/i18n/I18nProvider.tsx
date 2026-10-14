"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DIR, type Locale } from "./config";
import { DICTIONARIES, type Dictionary } from "./dictionaries";

type I18n = { locale: Locale; dir: "ltr" | "rtl"; t: Dictionary };

const I18nContext = createContext<I18n>({ locale: "en", dir: "ltr", t: DICTIONARIES.en });

/** The page's language for client components (the nav). Without a provider they read English. */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <I18nContext value={{ locale, dir: DIR[locale], t: DICTIONARIES[locale] }}>{children}</I18nContext>;
}

export const useI18n = () => useContext(I18nContext);
