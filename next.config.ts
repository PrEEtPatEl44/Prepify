import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.ts",
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.brandfetch.io",
      },
    ],
  },
};

export default nextConfig;
