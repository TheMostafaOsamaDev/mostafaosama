"use client";

import dynamic from "next/dynamic";

/**
 * The nav renders in the browser only. Its look depends on the screen (desktop or mobile setup, what fits), which
 * the server can't know: a server render would show the desktop bar first and then jump on phones (layout shift)
 * and render twice. Rendered once on the client it appears straight in place, behind its entrance animation, and
 * GSAP loads in its own chunk instead of with the page.
 */
export const LazySiteNav = dynamic(() => import("./SiteNav").then((m) => m.SiteNav), { ssr: false });
