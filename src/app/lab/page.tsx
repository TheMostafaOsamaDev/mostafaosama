import type { Metadata } from "next";
import { LabIndex } from "@/components/LabIndex";
import { SiteFooter } from "@/components/SiteFooter";
import { SubpageHeader } from "@/components/SubpageHeader";
import { lab } from "@/content/lab";
import { previews } from "@/lab/previews";

export const metadata: Metadata = {
  title: "Lab",
  description: "Small simulations of things that go wrong in backends: retry storms, duplicate deliveries and rate limits.",
  alternates: { canonical: "/lab" },
};

export default function LabPage() {
  const items = lab.map((e) => {
    const Preview = previews[e.slug];
    return { slug: e.slug, title: e.title, summary: e.summary, year: e.year, preview: <Preview /> };
  });

  return (
    <main id="main" className="mx-auto max-w-[40rem] px-4 pt-12 pb-12 sm:px-6 sm:pt-16">
      <SubpageHeader />
      <h1 className="mt-12 text-title font-semibold tracking-[-0.015em]">Lab</h1>
      <p className="mt-3 text-muted">Things I built to understand something. A few of them still work.</p>
      <div className="mt-12">
        <LabIndex items={items} />
      </div>
      <SiteFooter />
    </main>
  );
}
