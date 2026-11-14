import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "CertiFree: free courses and certifications",
    short_name: "CertiFree",
    description: "Every free course and certification in one place, with your saved courses, courses in progress and certificates.",
    start_url: "/?source=app",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "any",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    categories: ["education", "productivity"],
    lang: "en",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    shortcuts: [
      { name: "Browse courses", url: "/courses", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Free certificates", url: "/courses?cost=free-cert", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "My Courses", url: "/learning", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "My Certificates", url: "/certificates", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
