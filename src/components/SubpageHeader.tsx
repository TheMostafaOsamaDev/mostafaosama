import Link from "next/link";
import { site } from "@/content/site";

/** The way back home on every page that isn't home. */
export function SubpageHeader({ section, href }: { section?: string; href?: string }) {
  return (
    <header className="flex flex-wrap items-baseline gap-x-2 text-small">
      <Link href="/" className="link font-semibold">
        {site.name}
      </Link>
      {section && href ? (
        <>
          <span aria-hidden className="text-span">
            /
          </span>
          <Link href={href} className="link">
            {section}
          </Link>
        </>
      ) : null}
    </header>
  );
}
