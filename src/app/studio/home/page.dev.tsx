import type { Metadata } from "next";
import { homeSettings } from "@/components/home/home";
import { navConfig } from "@/components/nav";
import { HomeStudio } from "./HomeStudio";

// Development only: `.dev.tsx` is a page extension only in `next dev` (see next.config.ts).
export const metadata: Metadata = { title: "Home studio", robots: { index: false, follow: false } };

export default function HomeStudioPage() {
  return <HomeStudio saved={homeSettings} nav={navConfig} />;
}
