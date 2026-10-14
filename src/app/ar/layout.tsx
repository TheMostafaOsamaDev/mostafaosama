import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";
import { fontVariables as arabic } from "@/fonts/site-arabic";
import { fontVariables as latin } from "@/fonts/site-latin";
import { siteMetadata, siteViewport } from "@/i18n/metadata";
import "../globals.css";

// Arabic, at "/ar", right to left. Loads the Arabic face, plus the Latin one for names like Onvaca and GitHub.
export const metadata = siteMetadata("ar");
export const viewport = siteViewport;

export default function ArabicLayout({ children }: { children: ReactNode }) {
  return (
    <SiteShell locale="ar" fontClass={`${latin} ${arabic}`}>
      {children}
    </SiteShell>
  );
}
