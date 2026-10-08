import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SubpageHeader } from "@/components/SubpageHeader";
import { getLabEntry, lab } from "@/content/lab";
import { ExperimentLoader } from "@/lab/Loader";

export function generateStaticParams() {
  return lab.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/lab/[slug]">): Promise<Metadata> {
  const entry = getLabEntry((await params).slug);
  if (!entry) return {};
  return { title: entry.title, description: entry.summary, alternates: { canonical: `/lab/${entry.slug}` } };
}

/** The shell doesn't depend on the URL, so partial prefetching can share it across experiments. */
export default function ExperimentPage({ params }: PageProps<"/lab/[slug]">) {
  return (
    <main id="main" className="mx-auto max-w-[40rem] px-4 pt-12 pb-12 sm:px-6 sm:pt-16">
      <SubpageHeader section="Lab" href="/lab" />
      <Suspense>
        <Experiment params={params} />
      </Suspense>
      <SiteFooter />
    </main>
  );
}

async function Experiment({ params }: { params: PageProps<"/lab/[slug]">["params"] }) {
  const entry = getLabEntry((await params).slug);
  if (!entry) notFound();
  return (
    <article className="mt-12">
      <h1 className="text-title font-semibold tracking-[-0.015em] text-balance">{entry.title}</h1>
      <p className="mt-3">{entry.intro}</p>
      <div className="mt-10 lg:mr-[-8rem] xl:mr-[-16rem]">
        <ExperimentLoader slug={entry.slug} />
      </div>
      <noscript>
        <p className="mt-6 text-muted">This experiment runs in the browser and needs JavaScript.</p>
      </noscript>
    </article>
  );
}
