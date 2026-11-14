"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { useBookmarks } from "@/lib/bookmarks";

const links = [
  { href: "/", label: "Home", icon: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
  { href: "/courses", label: "Browse", icon: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm10 17l-5-5" },
  { href: "/providers", label: "Providers", icon: "M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M8 8h2M8 12h2M8 16h2M3 21h18" },
  { href: "/certificates", label: "Certificates", icon: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.5 14l-1.5 7 5-3 5 3-1.5-7" },
  { href: "/saved", label: "Saved", icon: "M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" },
];

function active(path: string, href: string) {
  return href === "/" ? path === "/" : path.startsWith(href);
}

export function Nav() {
  const path = usePathname();
  const { ids } = useBookmarks();
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="CertiFree home"><Logo /></Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-xl px-4 py-2 font-medium transition ${active(path, l.href) ? "bg-brand/10 text-brand" : "text-muted hover:text-ink"}`}
              >
                {l.label}
                {l.href === "/saved" && ids.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-brand px-1.5 py-0.5 text-xs text-white">{ids.length}</span>
                )}
              </Link>
            ))}
          </nav>
          <Link href="/courses?cost=free-cert" className="hidden rounded-xl bg-brand px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-brand-600 sm:inline-flex">
            Free certificates
          </Link>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Main">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${active(path, l.href) ? "text-brand" : "text-muted"}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={l.icon} /></svg>
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
