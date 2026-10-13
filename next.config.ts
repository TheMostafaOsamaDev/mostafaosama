import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
