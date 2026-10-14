"use client";

import { createContext, useContext, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUp01Icon,
  Briefcase01Icon,
  Cancel01Icon,
  Copy01Icon,
  File01Icon,
  GithubIcon,
  Home01Icon,
  LanguageSkillIcon,
  Linkedin01Icon,
  Mail01Icon,
  Menu01Icon,
  Message01Icon,
  Moon02Icon,
  PenTool01Icon,
  Route01Icon,
  Search01Icon,
  SlidersHorizontalIcon,
  Sun03Icon,
  TestTube01Icon,
  Tick02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import type { NavItemId, NavProfile } from "@/components/nav";

/** Nav items plus the icons some of them switch to (theme: sun / moon, copy: check, menu: close). */
export type IconId = NavItemId | "close" | "sun" | "moon" | "check";
export type IconStyle = Pick<NavProfile, "stroke" | "phosphorWeight"> & { size: number; filled: boolean };
export type NavIconProps = { library: NavProfile["library"]; id: IconId; style: IconStyle };

const HUGE: Record<IconId, typeof Home01Icon> = {
  home: Home01Icon,
  work: Briefcase01Icon,
  experience: Route01Icon,
  lab: TestTube01Icon,
  writing: PenTool01Icon,
  about: UserIcon,
  contact: Message01Icon,
  github: GithubIcon,
  linkedin: Linkedin01Icon,
  email: Mail01Icon,
  cv: File01Icon,
  search: Search01Icon,
  theme: Moon02Icon,
  copy: Copy01Icon,
  top: ArrowUp01Icon,
  settings: SlidersHorizontalIcon,
  menu: Menu01Icon,
  lang: LanguageSkillIcon,
  close: Cancel01Icon,
  sun: Sun03Icon,
  moon: Moon02Icon,
  check: Tick02Icon,
};

/**
 * The site's icons: Hugeicons, the library chosen in the nav studio. Only these are bundled. If nav.settings.json
 * switches library, swap the imports here (the studio's own icons.tsx has every library's names).
 */
function HugeNavIcon({ id, style }: NavIconProps) {
  return <HugeiconsIcon icon={HUGE[id]} size={style.size} strokeWidth={style.stroke} aria-hidden />;
}

/** How the nav draws an icon. The studio provides a renderer that covers every library. */
export const NavIconContext = createContext<(props: NavIconProps) => ReactNode>(HugeNavIcon);

/** A nav icon, drawn by the renderer in context (Hugeicons on the site). */
export function NavIcon(props: NavIconProps) {
  return useContext(NavIconContext)(props);
}
