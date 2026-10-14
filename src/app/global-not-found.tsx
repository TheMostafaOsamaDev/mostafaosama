import type { Metadata } from "next";
import Link from "next/link";
import { RootDocument } from "@/components/RootDocument";
import { fontVariables as latin } from "@/fonts/site-latin";
import "./globals.css";

// Unknown URLs. The site has several root layouts (English, Arabic), so there's no single layout to render
// a 404 inside; Next serves this page directly instead.
export const metadata: Metadata = { title: "Not found", robots: { index: false } };

export default function GlobalNotFound() {
  return (
    <RootDocument lang="en" dir="ltr" fontClass={latin}>
      <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center px-6">
        <p className="text-sm text-muted">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">This page doesn&apos;t exist.</h1>
        <p className="mt-3 text-muted">
          <Link href="/" className="underline underline-offset-4">
            Back to the home page
          </Link>{" "}
          ·{" "}
          <Link href="/ar" lang="ar" className="underline underline-offset-4">
            العودة إلى الصفحة الرئيسية
          </Link>
        </p>
      </main>
    </RootDocument>
  );
}
