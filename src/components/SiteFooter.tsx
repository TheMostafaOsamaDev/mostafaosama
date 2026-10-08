import { site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-hairline pt-6 text-small text-muted">
      <p>
        Reach me at{" "}
        <a href={`mailto:${site.email}`} className="link select-all">
          {site.email}
        </a>
        , or find me on{" "}
        <a href={site.links.github} className="link" target="_blank" rel="noreferrer">
          GitHub
        </a>{" "}
        and{" "}
        <a href={site.links.linkedin} className="link" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        . My{" "}
        <a href={site.links.cv} className="link">
          CV
        </a>{" "}
        is one page.
      </p>
    </footer>
  );
}
