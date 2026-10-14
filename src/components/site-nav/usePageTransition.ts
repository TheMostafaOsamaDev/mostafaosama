"use client";

import { useEffect } from "react";
import { pageTransitionVars, type NavConfig } from "@/components/nav";
import { usePreferences } from "@/components/preferences";
import { useIsDesktop } from "./FloatingNav";

/** Sets the page transition's variables on <html> (read by the ::view-transition rules in nav.css). */
export function usePageTransition(config: NavConfig) {
  const desktop = useIsDesktop(config.breakpoint);
  const reduced = usePreferences()?.reduced ?? false;
  const profile = desktop ? config.desktop : config.mobile;
  useEffect(() => {
    const vars = pageTransitionVars(profile, reduced);
    const root = document.documentElement.style;
    for (const [k, v] of Object.entries(vars)) root.setProperty(k, v);
    return () => Object.keys(vars).forEach((k) => root.removeProperty(k));
  }, [profile, reduced]);
}
