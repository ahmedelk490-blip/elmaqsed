import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // HTML must always be revalidated: the CDN was keeping pages for a year, so visitors could get a page from before a deploy
  async headers() {
    return [{ source: "/((?!_next/|img/|og/|brand/).*)", headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }] }];
  },
  async redirects() {
    return [
      { source: "/visa/schengen", destination: "/visa/france", permanent: true },
      ...["canada", "australia", "japan", "china", "india", "bosnia"].map((s) => ({ source: `/visa/${s}`, destination: "/destinations", permanent: false })),
    ];
  },
  images: { loader: "custom", loaderFile: "./src/lib/imgLoader.ts", deviceSizes: [640, 1080, 1920], imageSizes: [256, 384], remotePatterns: [{ protocol: "https", hostname: "upload.wikimedia.org" }, { protocol: "https", hostname: "thumb.wikimedia.org" }] },
};

export default nextConfig;
