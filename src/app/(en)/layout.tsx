import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";
import { fontVariables as latin } from "@/fonts/site-latin";
import { siteMetadata, siteViewport } from "@/i18n/metadata";
import "../globals.css";

// English, at "/". Only the Latin face is loaded (and preloaded) here.
export const metadata = siteMetadata("en");
export const viewport = siteViewport;

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return (
    <SiteShell locale="en" fontClass={latin}>
      {children}
    </SiteShell>
  );
}
