import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // "Now" for ongoing spans. Inlined at build so rendering stays deterministic (see src/lib/time.ts).
  env: {
    BUILD_DATE: new Date().toISOString(),
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withMDX = createMDX({
  options: {
    // Turbopack needs plugins by name, not as imported functions.
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);
