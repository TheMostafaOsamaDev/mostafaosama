import type { Metadata } from "next";
import { glowSettings } from "@/components/glow";
import { GlowStudio } from "./GlowStudio";

// Development only: `.dev.tsx` is a page extension only in `next dev` (see next.config.ts), so this route
// doesn't exist in production builds.
export const metadata: Metadata = { title: "Glow studio", robots: { index: false, follow: false } };

export default function StudioPage() {
  return <GlowStudio saved={glowSettings} />;
}
