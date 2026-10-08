import type { Metadata } from "next";
import Link from "next/link";
import { FailedTrace } from "@/components/FailedTrace";
import { SubpageHeader } from "@/components/SubpageHeader";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-[40rem] px-4 pt-12 pb-16 sm:px-6 sm:pt-16">
      <SubpageHeader />
      <h1 className="mt-16 text-title font-semibold tracking-[-0.015em]">That route doesn&apos;t exist.</h1>
      <p className="mt-3 text-muted">It failed fast, at least.</p>
      <div className="mt-10">
        <FailedTrace />
      </div>
      <p className="mt-12">
        <Link href="/" className="link">
          Back to the home page
        </Link>
        <span className="text-muted">, or try the </span>
        <Link href="/lab" className="link">
          lab
        </Link>
        <span className="text-muted">, where things fail on purpose.</span>
      </p>
    </main>
  );
}
