import type { CSSProperties, ReactNode } from "react";
import { CornerGlow } from "@/components/CornerGlow";
import { glowSettings } from "@/components/glow";
import { RESTORE_PREFERENCES } from "@/components/preferences-script";
import { buttonSettings } from "@/components/ui/button-settings";

/**
 * The <html> every root layout shares (English, Arabic, the studios, the 404). The inline script sets
 * data-theme / data-motion before hydration, hence suppressHydrationWarning.
 */
export function RootDocument({
  lang,
  dir,
  fontClass,
  children,
}: {
  lang: string;
  dir: "ltr" | "rtl";
  /** The fonts' CSS variable classes, from the root layout that loads them. */
  fontClass: string;
  children: ReactNode;
}) {
  return (
    <html
      lang={lang}
      dir={dir}
      className={fontClass}
      // The primary colour's palette (globals.css), chosen in the button studio.
      data-primary={buttonSettings.primary}
      style={{ "--glow-base": glowSettings.background } as CSSProperties}
      suppressHydrationWarning
    >
      {/* App Router root shells own their <head>; next/head is the Pages Router's. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: RESTORE_PREFERENCES }} />
      </head>
      <body className="min-h-dvh">
        <CornerGlow />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
