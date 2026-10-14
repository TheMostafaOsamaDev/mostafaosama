/** The site's languages. English lives at "/" (app/(en)), Arabic at "/ar" (app/ar). */
export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DIR: Record<Locale, "ltr" | "rtl"> = { en: "ltr", ar: "rtl" };
export const hasLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value);

/** The home page's URL in a language: "/" for English, "/ar" for Arabic. */
export const homePath = (locale: Locale) => (locale === "en" ? "/" : `/${locale}`);
