"use client";

import type { ComponentType, SVGProps } from "react";
import * as Lucide from "lucide-react";
import * as Phosphor from "@phosphor-icons/react";
import * as Tabler from "@tabler/icons-react";
import * as HeroOutline from "@heroicons/react/24/outline";
import * as HeroSolid from "@heroicons/react/24/solid";
import * as Remix from "@remixicon/react";
import * as Iconoir from "iconoir-react";
import { HugeiconsIcon } from "@hugeicons/react";
import * as Huge from "@hugeicons/core-free-icons";
import type { NavProfile } from "@/components/nav";
import type { IconId, IconStyle, NavIconProps } from "@/components/site-nav/icons";

type Library = NavProfile["library"];
type Style = IconStyle;

/** What the studio shows next to each library. Counts were measured from the installed packages (2026-10-13). */
export const LIBRARIES: Record<
  Library,
  { name: string; meta: string; stroke: boolean; filled: boolean; brands: boolean }
> = {
  lucide: { name: "Lucide", meta: "1,877 icons · ISC · stroke", stroke: true, filled: false, brands: false },
  phosphor: { name: "Phosphor", meta: "1,515 icons × 6 weights · MIT", stroke: false, filled: true, brands: true },
  tabler: { name: "Tabler", meta: "5,238 outline + 1,057 filled · MIT", stroke: true, filled: true, brands: true },
  heroicons: {
    name: "Heroicons",
    meta: "324 icons · outline + solid · MIT",
    stroke: true,
    filled: true,
    brands: false,
  },
  remix: {
    name: "Remix Icon",
    meta: "3,227 icons · line + fill · Apache-2.0",
    stroke: false,
    filled: true,
    brands: true,
  },
  iconoir: { name: "Iconoir", meta: "1,673 icons · MIT · stroke", stroke: true, filled: false, brands: true },
  hugeicons: { name: "Hugeicons", meta: "4,600+ free icons · MIT · stroke", stroke: true, filled: false, brands: true },
};

// Lucide and Heroicons have no brand logos (Lucide removed them). Tabler's brand set uses the same 24px grid and
// round strokes, so it stands in for GitHub and LinkedIn there.
const tablerBrand = (id: "github" | "linkedin", s: Style) => {
  const Icon = id === "github" ? Tabler.IconBrandGithub : Tabler.IconBrandLinkedin;
  return <Icon size={s.size} stroke={s.stroke} aria-hidden />;
};

type Svg = ComponentType<SVGProps<SVGSVGElement>>;
type NoBrands = Exclude<IconId, "github" | "linkedin">;

const LUCIDE: Record<NoBrands, Lucide.LucideIcon> = {
  home: Lucide.House,
  work: Lucide.BriefcaseBusiness,
  experience: Lucide.Milestone,
  lab: Lucide.FlaskConical,
  writing: Lucide.PenLine,
  about: Lucide.User,
  contact: Lucide.MessageCircle,
  email: Lucide.Mail,
  cv: Lucide.FileText,
  search: Lucide.Search,
  theme: Lucide.Moon,
  copy: Lucide.Copy,
  top: Lucide.ArrowUp,
  settings: Lucide.SlidersHorizontal,
  menu: Lucide.Menu,
  lang: Lucide.Languages,
  close: Lucide.X,
  sun: Lucide.Sun,
  moon: Lucide.Moon,
  check: Lucide.Check,
};

const PHOSPHOR: Record<IconId, Phosphor.Icon> = {
  home: Phosphor.House,
  work: Phosphor.Briefcase,
  experience: Phosphor.Path,
  lab: Phosphor.Flask,
  writing: Phosphor.PenNib,
  about: Phosphor.User,
  contact: Phosphor.ChatCircle,
  github: Phosphor.GithubLogo,
  linkedin: Phosphor.LinkedinLogo,
  email: Phosphor.Envelope,
  cv: Phosphor.FileText,
  search: Phosphor.MagnifyingGlass,
  theme: Phosphor.Moon,
  copy: Phosphor.Copy,
  top: Phosphor.ArrowUp,
  settings: Phosphor.SlidersHorizontal,
  menu: Phosphor.List,
  lang: Phosphor.Translate,
  close: Phosphor.X,
  sun: Phosphor.Sun,
  moon: Phosphor.Moon,
  check: Phosphor.Check,
};

type TablerIcon = typeof Tabler.IconHome;
const TABLER: Record<IconId, [TablerIcon, TablerIcon?]> = {
  home: [Tabler.IconHome, Tabler.IconHomeFilled],
  work: [Tabler.IconBriefcase, Tabler.IconBriefcaseFilled],
  experience: [Tabler.IconTimeline],
  lab: [Tabler.IconFlask, Tabler.IconFlaskFilled],
  writing: [Tabler.IconPencil, Tabler.IconPencilFilled],
  about: [Tabler.IconUser, Tabler.IconUserFilled],
  contact: [Tabler.IconMessageCircle, Tabler.IconMessageCircleFilled],
  github: [Tabler.IconBrandGithub, Tabler.IconBrandGithubFilled],
  linkedin: [Tabler.IconBrandLinkedin, Tabler.IconBrandLinkedinFilled],
  email: [Tabler.IconMail, Tabler.IconMailFilled],
  cv: [Tabler.IconFileText, Tabler.IconFileTextFilled],
  search: [Tabler.IconSearch],
  theme: [Tabler.IconMoon, Tabler.IconMoonFilled],
  copy: [Tabler.IconCopy],
  top: [Tabler.IconArrowUp],
  settings: [Tabler.IconAdjustmentsHorizontal],
  menu: [Tabler.IconMenu2],
  lang: [Tabler.IconLanguage],
  close: [Tabler.IconX],
  sun: [Tabler.IconSun, Tabler.IconSunFilled],
  moon: [Tabler.IconMoon, Tabler.IconMoonFilled],
  check: [Tabler.IconCheck],
};

const HERO: Record<NoBrands, [Svg, Svg]> = {
  home: [HeroOutline.HomeIcon, HeroSolid.HomeIcon],
  work: [HeroOutline.BriefcaseIcon, HeroSolid.BriefcaseIcon],
  experience: [HeroOutline.MapIcon, HeroSolid.MapIcon],
  lab: [HeroOutline.BeakerIcon, HeroSolid.BeakerIcon],
  writing: [HeroOutline.PencilSquareIcon, HeroSolid.PencilSquareIcon],
  about: [HeroOutline.UserIcon, HeroSolid.UserIcon],
  contact: [HeroOutline.ChatBubbleOvalLeftIcon, HeroSolid.ChatBubbleOvalLeftIcon],
  email: [HeroOutline.EnvelopeIcon, HeroSolid.EnvelopeIcon],
  cv: [HeroOutline.DocumentTextIcon, HeroSolid.DocumentTextIcon],
  search: [HeroOutline.MagnifyingGlassIcon, HeroSolid.MagnifyingGlassIcon],
  theme: [HeroOutline.MoonIcon, HeroSolid.MoonIcon],
  copy: [HeroOutline.DocumentDuplicateIcon, HeroSolid.DocumentDuplicateIcon],
  top: [HeroOutline.ArrowUpIcon, HeroSolid.ArrowUpIcon],
  settings: [HeroOutline.AdjustmentsHorizontalIcon, HeroSolid.AdjustmentsHorizontalIcon],
  menu: [HeroOutline.Bars3Icon, HeroSolid.Bars3Icon],
  lang: [HeroOutline.LanguageIcon, HeroSolid.LanguageIcon],
  close: [HeroOutline.XMarkIcon, HeroSolid.XMarkIcon],
  sun: [HeroOutline.SunIcon, HeroSolid.SunIcon],
  moon: [HeroOutline.MoonIcon, HeroSolid.MoonIcon],
  check: [HeroOutline.CheckIcon, HeroSolid.CheckIcon],
};

type RemixIcon = typeof Remix.RiHome5Line;
const REMIX: Record<IconId, [RemixIcon, RemixIcon]> = {
  home: [Remix.RiHome5Line, Remix.RiHome5Fill],
  work: [Remix.RiBriefcase4Line, Remix.RiBriefcase4Fill],
  experience: [Remix.RiRouteLine, Remix.RiRouteFill],
  lab: [Remix.RiFlaskLine, Remix.RiFlaskFill],
  writing: [Remix.RiQuillPenLine, Remix.RiQuillPenFill],
  about: [Remix.RiUser3Line, Remix.RiUser3Fill],
  contact: [Remix.RiChat3Line, Remix.RiChat3Fill],
  github: [Remix.RiGithubLine, Remix.RiGithubFill],
  linkedin: [Remix.RiLinkedinBoxLine, Remix.RiLinkedinBoxFill],
  email: [Remix.RiMailLine, Remix.RiMailFill],
  cv: [Remix.RiFileTextLine, Remix.RiFileTextFill],
  search: [Remix.RiSearchLine, Remix.RiSearchLine],
  theme: [Remix.RiMoonLine, Remix.RiMoonLine],
  copy: [Remix.RiFileCopyLine, Remix.RiFileCopyLine],
  top: [Remix.RiArrowUpLine, Remix.RiArrowUpLine],
  settings: [Remix.RiEqualizerLine, Remix.RiEqualizerLine],
  menu: [Remix.RiMenuLine, Remix.RiMenuLine],
  lang: [Remix.RiTranslate2, Remix.RiTranslate2],
  close: [Remix.RiCloseLine, Remix.RiCloseLine],
  sun: [Remix.RiSunLine, Remix.RiSunLine],
  moon: [Remix.RiMoonLine, Remix.RiMoonLine],
  check: [Remix.RiCheckLine, Remix.RiCheckLine],
};

const ICONOIR: Record<IconId, Svg> = {
  home: Iconoir.HomeSimpleDoor,
  work: Iconoir.Suitcase,
  experience: Iconoir.Map,
  lab: Iconoir.Flask,
  writing: Iconoir.EditPencil,
  about: Iconoir.User,
  contact: Iconoir.ChatBubble,
  github: Iconoir.Github,
  linkedin: Iconoir.Linkedin,
  email: Iconoir.Mail,
  cv: Iconoir.Page,
  search: Iconoir.Search,
  theme: Iconoir.HalfMoon,
  copy: Iconoir.Copy,
  top: Iconoir.ArrowUp,
  settings: Iconoir.Settings,
  menu: Iconoir.Menu,
  lang: Iconoir.Language,
  close: Iconoir.Xmark,
  sun: Iconoir.SunLight,
  moon: Iconoir.HalfMoon,
  check: Iconoir.Check,
};

const HUGE: Record<IconId, typeof Huge.Home01Icon> = {
  home: Huge.Home01Icon,
  work: Huge.Briefcase01Icon,
  experience: Huge.Route01Icon,
  lab: Huge.TestTube01Icon,
  writing: Huge.PenTool01Icon,
  about: Huge.UserIcon,
  contact: Huge.Message01Icon,
  github: Huge.GithubIcon,
  linkedin: Huge.Linkedin01Icon,
  email: Huge.Mail01Icon,
  cv: Huge.File01Icon,
  search: Huge.Search01Icon,
  theme: Huge.Moon02Icon,
  copy: Huge.Copy01Icon,
  top: Huge.ArrowUp01Icon,
  settings: Huge.SlidersHorizontalIcon,
  menu: Huge.Menu01Icon,
  lang: Huge.LanguageSkillIcon,
  close: Huge.Cancel01Icon,
  sun: Huge.Sun03Icon,
  moon: Huge.Moon02Icon,
  check: Huge.Tick02Icon,
};

/**
 * One nav icon in any library, so the studio can compare them (the site bundles only its chosen library; see
 * components/site-nav/icons.tsx). Decorative: the control around it carries the name.
 */
export function NavIcon({ library, id, style }: NavIconProps) {
  const { size, stroke, filled } = style;
  switch (library) {
    case "lucide": {
      if (id === "github" || id === "linkedin") return tablerBrand(id, style);
      const Icon = LUCIDE[id];
      return <Icon size={size} strokeWidth={stroke} aria-hidden />;
    }
    case "phosphor": {
      const Icon = PHOSPHOR[id];
      return <Icon size={size} weight={filled ? "fill" : style.phosphorWeight} aria-hidden />;
    }
    case "tabler": {
      const [Outline, Filled] = TABLER[id];
      const Icon = filled && Filled ? Filled : Outline;
      return <Icon size={size} stroke={stroke} aria-hidden />;
    }
    case "heroicons": {
      if (id === "github" || id === "linkedin") return tablerBrand(id, style);
      const Icon = HERO[id][filled ? 1 : 0];
      return <Icon width={size} height={size} strokeWidth={filled ? undefined : stroke} aria-hidden />;
    }
    case "remix": {
      const Icon = REMIX[id][filled ? 1 : 0];
      return <Icon size={size} aria-hidden />;
    }
    case "iconoir": {
      const Icon = ICONOIR[id];
      return <Icon width={size} height={size} strokeWidth={stroke} aria-hidden />;
    }
    case "hugeicons":
      return <HugeiconsIcon icon={HUGE[id]} size={size} strokeWidth={stroke} aria-hidden />;
  }
}

/** NavIcon as a plain render function, for the site nav's icon context. */
export const renderAnyIcon = (props: NavIconProps) => <NavIcon {...props} />;
