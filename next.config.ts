import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { loader: "custom", loaderFile: "./src/lib/imgLoader.ts", deviceSizes: [640, 1080, 1920], imageSizes: [256, 384], remotePatterns: [{ protocol: "https", hostname: "upload.wikimedia.org" }, { protocol: "https", hostname: "thumb.wikimedia.org" }] },
};

export default nextConfig;
