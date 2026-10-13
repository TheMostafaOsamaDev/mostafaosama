import type { Metadata, Viewport } from "next";
import { CornerGlow } from "@/components/CornerGlow";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mostafa Osama",
  description: "Full stack developer at Onvaca.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <CornerGlow />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
