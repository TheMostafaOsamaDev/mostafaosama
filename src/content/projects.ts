import type { SpanDate } from "@/lib/time";

export type ProjectLink = { label: string; href: string };

export type Project = {
  id: string;
  name: string;
  start: SpanDate;
  end: SpanDate | null;
  /** Drawn as a child span, indented under this project id. */
  parent?: string;
  /** One line, shown when the entry opens. */
  summary: string;
  /** Optional lines, each short. Rendered as "Built", "Detail", "Numbers" rows. */
  built?: string[];
  detail?: string;
  numbers?: string;
  stack: string[];
  links: ProjectLink[];
};

// Every number here is checkable:
// - Onvaca PR counts: Bitbucket, merged PRs authored by Mostafa as of 2026-10-08
//   (550 onvaca-backend, 237 onvaca-frontend, 82 onvaca-admin).
// - Riwaq releases/downloads: GitHub releases API as of 2026-10-08 (9 releases, 1,157 asset downloads).
// - Dates: CV for Onvaca; repository creation and last-push dates for the rest.
export const projects: Project[] = [
  {
    id: "onvaca",
    name: "Onvaca",
    start: "2024-08",
    end: null,
    summary: "Vacation-rental marketplace. I work across the backend and the Next.js frontend.",
    built: [
      "Refunds, payouts and multi-currency logic across Stripe and Paymob",
      "Reservation pricing and the Split & Share group-booking flow",
      "GraphQL performance work: batched loaders and parallel resolvers",
      "Moving frontend code out of the API server to split the monolith",
    ],
    numbers: "850+ merged pull requests, about two thirds of them backend",
    stack: ["Node.js", "GraphQL", "MySQL", "Redis", "AWS", "Next.js"],
    links: [{ label: "onvaca.com", href: "https://www.onvaca.com" }],
  },
  {
    id: "feather-blog",
    name: "Feather Blog",
    start: "2023-10",
    end: "2024-04",
    summary: "Blogging platform with a NestJS API and a Next.js 14 frontend.",
    detail:
      "Threaded comments, likes, drafts, title and tag search, a trending feed, Google OAuth and avatar resizing. The API is documented with Swagger.",
    stack: ["NestJS", "MongoDB", "Next.js", "Redux", "Editor.js"],
    links: [
      { label: "API source", href: "https://github.com/TheMostafaOsamaDev/nestjs-feather-blog" },
      { label: "Frontend source", href: "https://github.com/TheMostafaOsamaDev/nextjs-feather-blog" },
    ],
  },
  {
    id: "chat-universe",
    name: "Chat Universe",
    start: "2024-11",
    end: "2025-01",
    summary: "Real-time chat with presence, profiles and live chat history.",
    detail: "A NestJS gateway over Socket.IO, MongoDB through Mongoose, and Passport for JWT and session auth.",
    stack: ["NestJS", "Socket.IO", "MongoDB", "Next.js"],
    links: [{ label: "Source", href: "https://github.com/TheMostafaOsamaDev/chat-universe" }],
  },
  {
    id: "riwaq",
    name: "Riwaq",
    start: "2026-05",
    end: null,
    summary:
      "Offline-first e-book reader for EPUB, PDF and Word files, on Windows, macOS, Linux and Android. No accounts, no sync, no analytics.",
    detail:
      "Six of its sixteen bundled faces are Naskh or Kufi. Word files open as flowing text or page-for-page, and highlights carry between the two.",
    numbers: "9 releases, 1,150+ downloads from GitHub releases",
    stack: ["Tauri 2", "Rust", "React", "TypeScript"],
    links: [
      { label: "Source", href: "https://github.com/TheMostafaOsamaDev/Riwaq-Reader" },
      { label: "Releases", href: "https://github.com/TheMostafaOsamaDev/Riwaq-Reader/releases" },
    ],
  },
  {
    id: "riwaq-extensions",
    name: "Riwaq Extensions",
    start: "2026-08",
    end: "2026-09",
    parent: "riwaq",
    summary: "The pipeline that builds, validates and publishes Riwaq's source extensions.",
    detail:
      "Extension code is plain parsing. The app injects a host API that is its only route to the network, a headless renderer and PDF parsing, so every source can be tested on its own.",
    stack: ["TypeScript"],
    links: [{ label: "Source", href: "https://github.com/TheMostafaOsamaDev/Riwaq-Extensions" }],
  },
];
