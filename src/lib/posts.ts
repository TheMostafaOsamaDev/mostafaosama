import fs from "node:fs";
import path from "node:path";
import type { ComponentType } from "react";

export type PostMeta = {
  title: string;
  description: string;
  /** ISO date, "2026-10-08". */
  date: string;
  /** Drafts render in `next dev` and 404 in production builds. */
  draft?: boolean;
};

export type Post = PostMeta & { slug: string };

const DIR = path.join(process.cwd(), "src/content/writing");
const SHOW_DRAFTS = process.env.NODE_ENV !== "production";

/** Every slug, drafts included. `generateStaticParams` needs at least one, so drafts stay listed and 404 later. */
export function getAllSlugs(): string[] {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export async function loadPost(slug: string): Promise<{ meta: PostMeta; Content: ComponentType } | null> {
  if (!getAllSlugs().includes(slug)) return null;
  const mod = (await import(`@/content/writing/${slug}.mdx`)) as { default: ComponentType; metadata: PostMeta };
  if (mod.metadata.draft && !SHOW_DRAFTS) return null;
  return { meta: mod.metadata, Content: mod.default };
}

/** Published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await Promise.all(
    getAllSlugs().map(async (slug) => {
      const post = await loadPost(slug);
      return post ? { slug, ...post.meta } : null;
    }),
  );
  return posts.filter((p): p is Post => p !== null).sort((a, b) => b.date.localeCompare(a.date));
}

export function formatPostDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
