import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SubpageHeader } from "@/components/SubpageHeader";
import { Toc } from "@/components/Toc";
import { formatPostDate, getAllSlugs, loadPost, readOutline } from "@/lib/posts";

// Drafts stay in this list (it may not be empty under Cache Components) and 404 in production.
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/writing/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.description,
    alternates: { canonical: `/writing/${slug}` },
    openGraph: { type: "article", title: post.meta.title, description: post.meta.description, publishedTime: post.meta.date },
  };
}

/** The shell doesn't depend on the URL, so partial prefetching can share it across posts. */
export default function PostPage({ params }: PageProps<"/writing/[slug]">) {
  return (
    <main id="main" className="mx-auto max-w-[40rem] px-4 pt-12 pb-12 sm:px-6 sm:pt-16">
      <SubpageHeader section="Writing" href="/writing" />
      <Suspense>
        <Post params={params} />
      </Suspense>
      <SiteFooter />
    </main>
  );
}

async function Post({ params }: { params: PageProps<"/writing/[slug]">["params"] }) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();
  const { meta, Content } = post;
  const { headings, minutes } = readOutline(slug);

  return (
    <article className="mt-12">
      <header>
        <p className="text-small text-muted tabular-nums">
          <time dateTime={meta.date}>{formatPostDate(meta.date)}</time>, {minutes} min read
          {meta.draft ? <span className="text-err">, draft</span> : null}
        </p>
        <h1 className="mt-2 text-title font-semibold tracking-[-0.015em] text-balance">{meta.title}</h1>
        <p className="mt-3 text-muted">{meta.description}</p>
      </header>
      <div className="relative">
        {headings.length > 2 ? (
          <aside className="absolute top-0 left-full ml-16 hidden h-full w-56 xl:block">
            <div className="sticky top-12 mt-12">
              <Toc headings={headings} />
            </div>
          </aside>
        ) : null}
        <div className="mt-8">
          <Content />
        </div>
      </div>
    </article>
  );
}
