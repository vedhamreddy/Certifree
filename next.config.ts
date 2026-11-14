import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/companies", destination: "/providers", permanent: true },
      { source: "/companies/:slug", destination: "/providers/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
