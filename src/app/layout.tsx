import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { Nav, TopBar } from "@/components/Nav";
import { RegisterSW } from "@/components/RegisterSW";
import { SyncWatcher } from "@/components/SyncWatcher";
import { SignInPrompt } from "@/components/SignInPrompt";
import { InstallBanner } from "@/components/InstallApp";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: { default: "CertiFree: every free certification in one place", template: "%s · CertiFree" },
  description: "Free courses and certifications from Google, Microsoft, AWS, IBM, Cisco, Coursera, edX, NPTEL and more, labeled by what is really free.",
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icon-192.png", sizes: "192x192", type: "image/png" }], apple: [{ url: "/icon-180.png", sizes: "180x180" }] },
  appleWebApp: { capable: true, title: "CertiFree", statusBarStyle: "default" },
  applicationName: "CertiFree",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans text-ink antialiased">
        <div className="app-backdrop" aria-hidden="true">
          <span className="orb orb-1" />
          <span className="orb orb-2" />
          <span className="orb orb-3" />
        </div>
        <Nav />
        <div className="min-h-dvh lg:py-3 lg:pl-64 lg:pr-3">
          <div className="min-h-dvh bg-white/80 lg:min-h-[calc(100dvh-1.5rem)] lg:rounded-[28px] lg:bg-white shell-wash lg:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_30px_60px_-30px_rgba(0,0,0,0.18)] lg:ring-1 lg:ring-black/[0.04]">
          <TopBar />
          <SyncWatcher />
          <main className="pb-24 lg:pb-0">{children}</main>
          <footer className="mx-auto max-w-7xl px-4 pb-28 pt-12 sm:px-6 lg:px-8 lg:pb-10">
            <div className="border-t border-line pt-6 text-sm leading-relaxed text-muted">
              CertiFree is an independent directory. Course names belong to their providers, and every link goes to the provider&apos;s own site. Free offers change, so confirm the details there before you enrol.
            </div>
          </footer>
          </div>
        </div>
        <SignInPrompt />
        <InstallBanner />
        <RegisterSW />
      </body>
    </html>
  );
}
