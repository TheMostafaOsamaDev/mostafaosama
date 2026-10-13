import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { CornerGlow } from "@/components/CornerGlow";
import { glowSettings } from "@/components/glow";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mostafa Osama",
  description: "Full stack developer at Onvaca.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: glowSettings.colors[0] },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" style={{ "--glow-base": glowSettings.colors[0] } as CSSProperties}>
      <body className="min-h-dvh">
        <CornerGlow />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
