import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { Nav } from "@/components/Nav";
import { RegisterSW } from "@/components/RegisterSW";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["600", "700"] });

export const metadata: Metadata = {
  title: { default: "CertiFree: every free certification in one place", template: "%s · CertiFree" },
  description: "Free courses and certifications from Google, Microsoft, AWS, IBM, Cisco, Coursera, edX, NPTEL and more, labeled by what is really free.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon-180.png" },
  appleWebApp: { capable: true, title: "CertiFree", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#4F46E5",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">
        <Nav />
        <main className="pb-24 md:pb-0">{children}</main>
        <footer className="mx-auto max-w-7xl px-4 pb-28 pt-10 text-sm text-muted sm:px-6 md:pb-10">
          CertiFree is an independent directory. Course names belong to their providers, and every link goes to the provider&apos;s own site. Free offers change, so confirm the details there before you enrol.
        </footer>
        <RegisterSW />
      </body>
    </html>
  );
}
