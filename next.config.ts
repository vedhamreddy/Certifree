import type { NextConfig } from "next";

const privateHeaders = [
  { key: "Cache-Control", value: "private, no-store" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Robots-Tag", value: "noindex" },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/companies", destination: "/providers", permanent: true },
      { source: "/companies/:slug", destination: "/providers/:slug", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      { source: "/api/:path*", headers: privateHeaders },
      { source: "/auth/:path*", headers: privateHeaders },
      { source: "/account", headers: privateHeaders },
      { source: "/sync", headers: privateHeaders },
    ];
  },
};

export default nextConfig;
