import type { MetadataRoute } from "next";
import { lab } from "@/content/lab";
import { site } from "@/content/site";
import { getPosts } from "@/lib/posts";
import { BUILD_DATE } from "@/lib/time";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  const url = (path: string) => new URL(path, site.url).toString();
  return [
    { url: url("/"), lastModified: BUILD_DATE },
    ...(posts.length ? [{ url: url("/writing"), lastModified: new Date(posts[0].date) }] : []),
    ...posts.map((p) => ({ url: url(`/writing/${p.slug}`), lastModified: new Date(p.date) })),
    { url: url("/lab"), lastModified: BUILD_DATE },
    ...lab.map((e) => ({ url: url(`/lab/${e.slug}`), lastModified: BUILD_DATE })),
  ];
}
