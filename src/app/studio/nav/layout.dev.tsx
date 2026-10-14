import type { Metadata } from "next";
import type { ReactNode } from "react";
import { navConfig } from "@/components/nav";
import { NavStudio } from "./NavStudio";
import "./studio.css";

// Development only: `.dev.tsx` is a page extension only in `next dev` (see next.config.ts), so /studio/nav
// doesn't exist in production builds.
export const metadata: Metadata = { title: "Nav studio", robots: { index: false, follow: false } };

export default function NavStudioLayout({ children }: { children: ReactNode }) {
  return <NavStudio saved={navConfig}>{children}</NavStudio>;
}
