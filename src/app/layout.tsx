import type { Metadata, Viewport } from "next";
import { Inter, Manrope, Noto_Sans_Devanagari, Noto_Sans_Telugu } from "next/font/google";
import { Nav, TopBar } from "@/components/Nav";
import { RegisterSW } from "@/components/RegisterSW";
import { SyncWatcher } from "@/components/SyncWatcher";
import { SignInPrompt } from "@/components/SignInPrompt";
import { InstallBanner } from "@/components/InstallApp";
import { CompareTray } from "@/components/CompareTray";
import { LANG_BOOT, T } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], weight: ["600", "700", "800"] });
// Hindi and Telugu glyphs. Not preloaded: the browser only downloads them when that script is on screen.
const deva = Noto_Sans_Devanagari({ variable: "--font-deva", subsets: ["devanagari"], weight: ["400", "600", "700"], preload: false });
const telugu = Noto_Sans_Telugu({ variable: "--font-telugu", subsets: ["telugu"], weight: ["400", "600", "700"], preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://certifree.vedhamreddym.workers.dev"),
  title: { default: "CertiFree: every free certification in one place", template: "%s · CertiFree" },
  openGraph: { siteName: "CertiFree", type: "website", locale: "en_IN" },
  twitter: { card: "summary_large_image" },
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${manrope.variable} ${deva.variable} ${telugu.variable}`}>
      <head>
        {/* Sets <html lang> to the saved language before the page paints. */}
        <script dangerouslySetInnerHTML={{ __html: LANG_BOOT }} />
      </head>
      <body className="font-sans text-ink antialiased">
        <div className="app-backdrop" aria-hidden="true" />
        <Nav />
        <div className="min-h-dvh lg:py-3 lg:pl-64 lg:pr-3">
          <div className="min-h-dvh shell-glass lg:min-h-[calc(100dvh-1.5rem)] lg:rounded-[28px] shell-wash lg:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_30px_60px_-30px_rgba(0,0,0,0.18)] lg:ring-1 lg:ring-black/[0.05]">
          <TopBar />
          <SyncWatcher />
          <main className="pb-24 lg:pb-0">{children}</main>
          <footer className="mx-auto max-w-7xl px-4 pb-28 pt-12 sm:px-6 lg:px-8 lg:pb-10">
            <div className="border-t border-line pt-6 text-sm leading-relaxed text-muted">
              <T k="footer" />
              <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-semibold text-ink" aria-label="Legal">
                <a href="/privacy" className="underline-offset-4 hover:underline"><T k="footer.privacy" /></a>
                <a href="/terms" className="underline-offset-4 hover:underline"><T k="footer.terms" /></a>
              </nav>
            </div>
          </footer>
          </div>
        </div>
        <SignInPrompt />
        <InstallBanner />
        <CompareTray />
        <RegisterSW />
        {process.env.NEXT_PUBLIC_CF_BEACON_TOKEN && (
          // Cloudflare Web Analytics: cookie-free page counts. Set NEXT_PUBLIC_CF_BEACON_TOKEN to switch it on.
          <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token: process.env.NEXT_PUBLIC_CF_BEACON_TOKEN })} />
        )}
      </body>
    </html>
  );
}
