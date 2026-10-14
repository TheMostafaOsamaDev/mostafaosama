import type { NextConfig } from "next";

export default function config(): NextConfig {
  return {
    // Off on purpose: Strict Mode (development only) runs every effect twice on the same element. React Bits'
    // Grainient destroys its WebGL context in cleanup, so the second run draws on a dead context and the
    // background never appears in `next dev`. Production is unaffected. Re-enable if Grainient changes.
    reactStrictMode: false,
    // Unknown URLs: the site has several root layouts (English, Arabic), so the 404 is
    // app/global-not-found.
    experimental: { globalNotFound: true },
    // English lives at "/" (app/(en)) and Arabic at "/ar" (app/ar); an /en link goes home.
    async redirects() {
      return [{ source: "/en", destination: "/", permanent: true }];
    },
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
