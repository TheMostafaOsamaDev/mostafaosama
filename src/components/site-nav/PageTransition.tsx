import { ViewTransition, type ReactElement } from "react";

/**
 * Wraps a page so it animates in and out on navigation. The classes match the ::view-transition rules in nav.css;
 * the nav tags each navigation with its direction (nav-forward / nav-back). The child must be a single element
 * marked `data-page`, which the "reveal" transition measures from.
 */
export function PageTransition({ children }: { children: ReactElement }) {
  return (
    <ViewTransition
      enter={{ "nav-forward": "pt-in-fwd", "nav-back": "pt-in-back", default: "pt-in" }}
      exit={{ "nav-forward": "pt-out-fwd", "nav-back": "pt-out-back", default: "pt-out" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
