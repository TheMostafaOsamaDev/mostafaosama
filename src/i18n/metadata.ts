import type { Metadata, Viewport } from "next";
import { glowSettings } from "@/components/glow";
import { LOCALES, homePath, type Locale } from "./config";
import { DICTIONARIES } from "./dictionaries";

/** Title, description, canonical and language links for a language's home page. */
export function siteMetadata(locale: Locale): Metadata {
  const t = DICTIONARIES[locale];
  return {
    // Canonical and language links must be absolute URLs (search engines and Lighthouse reject relative ones).
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://mostafa-osama-official.vercel.app"),
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: homePath(locale),
      languages: { ...Object.fromEntries(LOCALES.map((l) => [l, homePath(l)])), "x-default": homePath("en") },
    },
  };
}

export const siteViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: glowSettings.background },
  ],
};
