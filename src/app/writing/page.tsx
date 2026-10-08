import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SubpageHeader } from "@/components/SubpageHeader";
import { formatPostDate, getPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on backend systems and the frontends that sit on them.",
  alternates: { canonical: "/writing" },
};

export default async function WritingPage() {
  const posts = await getPosts();

  return (
    <main id="main" className="mx-auto max-w-[40rem] px-4 pt-12 pb-12 sm:px-6 sm:pt-16">
      <SubpageHeader />
      <h1 className="mt-12 text-title font-semibold tracking-[-0.015em]">Writing</h1>
      {posts.length === 0 ? (
        <p className="mt-4 text-muted">
          Nothing published yet. The{" "}
          <Link href="/lab" className="link">
            lab
          </Link>{" "}
          has something to play with in the meantime.
        </p>
      ) : (
        <ol className="mt-8 grid gap-8">
          {posts.map((post) => (
            <li key={post.slug}>
              <p className="text-small text-muted tabular-nums">
                <time dateTime={post.date}>{formatPostDate(post.date)}</time>
              </p>
              <h2 className="mt-1 font-semibold">
                <Link href={`/writing/${post.slug}`} prefetch className="link">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-1 text-muted">{post.description}</p>
            </li>
          ))}
        </ol>
      )}
      <SiteFooter />
    </main>
  );
}
