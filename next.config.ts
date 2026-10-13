import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import type { NextConfig } from "next";

export default function config(phase: string): NextConfig {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    // `page.dev.tsx` / `route.dev.ts` files exist only under `next dev` (the /studio playground and its save
    // route). Production builds don't recognise the extension, so those routes are never built or deployed.
    pageExtensions: dev ? ["dev.tsx", "dev.ts", "tsx", "ts"] : ["tsx", "ts"],
    // Off on purpose: Strict Mode (development only) runs every effect twice on the same element. React Bits'
    // Grainient destroys its WebGL context in cleanup, so the second run draws on a dead context and the
    // background never appears in `next dev`. Production is unaffected. Re-enable if Grainient changes.
    reactStrictMode: false,
    cacheComponents: true,
    partialPrefetching: true,
    turbopack: {
      rules: {
        "*.css": {
          loaders: ["@tailwindcss/turbopack"],
          as: "*.css",
        },
      },
    },
  };
}
