"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, BadgeCheck, BookOpen, Building2, CircleUserRound, Compass, Heart, House, LogIn, RefreshCw, Search, type LucideIcon } from "lucide-react";
import { useMe } from "@/lib/sync";
import { Logo } from "./Logo";
import { useBookmarks } from "@/lib/bookmarks";

const links: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/courses", label: "Browse", icon: Compass },
  { href: "/providers", label: "Providers", icon: Building2 },
  { href: "/learning", label: "My Courses", icon: BookOpen },
  { href: "/certificates", label: "Certificates", icon: Award },
  { href: "/saved", label: "Saved", icon: Heart },
];

function active(path: string, href: string) {
  return href === "/" ? path === "/" : path.startsWith(href);
}

/** Desktop sidebar (lg and up). */
export function Sidebar() {
  const path = usePathname();
  const { ids } = useBookmarks();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-16 items-center px-6">
        <Link href="/" aria-label="CertiFree home"><Logo /></Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Menu</p>
        {links.map(({ href, label, icon: Icon }) => {
          const on = active(path, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors duration-150 ${on ? "bg-accent/[0.08] text-brand" : "text-muted hover:bg-surface-2 hover:text-ink"}`}
            >
              <Icon size={18} strokeWidth={1.75} className={on ? "text-accent" : "text-muted transition-colors group-hover:text-ink"} aria-hidden />
              <span className="flex-1">{label}</span>
              {href === "/saved" && ids.length > 0 && (
                <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">{ids.length}</span>
              )}
            </Link>
          );
        })}
        <p className="px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">You</p>
        {[
          { href: "/account", label: "Account", icon: CircleUserRound },
          { href: "/sync", label: "Sync devices", icon: RefreshCw },
        ].map(({ href, label, icon: Icon }) => {
          const on = path.startsWith(href) || (href === "/account" && path.startsWith("/auth"));
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors duration-150 ${on ? "bg-accent/[0.08] text-brand" : "text-muted hover:bg-surface-2 hover:text-ink"}`}
            >
              <Icon size={18} strokeWidth={1.75} className={on ? "text-accent" : "text-muted transition-colors group-hover:text-ink"} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 rounded-2xl border border-line bg-surface-2 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <BadgeCheck size={16} strokeWidth={1.75} className="text-accent" aria-hidden /> Free certificates
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted">Courses where both the learning and the credential cost nothing.</p>
        <Link href="/courses?cost=free-cert" className="mt-3 inline-flex text-sm font-semibold text-accent hover:text-brand">
          Explore →
        </Link>
      </div>
    </aside>
  );
}

/** Account entry, always visible. Signed out (or accounts not set up yet) it reads "Sign in". */
function AccountLink() {
  const me = useMe();
  if (me?.signedIn) {
    return (
      <Link href="/account" className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-brand shadow-card transition hover:border-slate-300 hover:bg-surface-2">
        <CircleUserRound size={17} strokeWidth={1.75} aria-hidden /> Account
      </Link>
    );
  }
  return (
    <Link href="/auth/sign-in?next=/sync" className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-ink shadow-card transition hover:border-slate-300 hover:bg-surface-2">
      <LogIn size={16} strokeWidth={1.75} aria-hidden /> Sign in
    </Link>
  );
}

/** Sticky top bar on every screen size. */
export function TopBar() {
  const path = usePathname();
  const current = links.find((l) => active(path, l.href));
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="CertiFree home" className="lg:hidden"><Logo /></Link>
        <span className="hidden text-sm font-medium text-muted lg:block">{current?.label ?? "CertiFree"}</span>
        <div className="flex flex-1 justify-end gap-3">
          {!path.startsWith("/courses") && (
            <form action="/courses" role="search" className="hidden w-full max-w-sm items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 transition-colors focus-within:border-accent focus-within:bg-white md:flex">
              <Search size={16} strokeWidth={1.75} className="shrink-0 text-muted" aria-hidden />
              <input name="q" placeholder="Search courses" aria-label="Search courses" className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
              <kbd className="hidden rounded-md border border-line bg-white px-1.5 text-[11px] font-medium text-muted xl:inline">↵</kbd>
            </form>
          )}
          <Link href="/courses?cost=free-cert" className="hidden h-9 shrink-0 items-center gap-1.5 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600 active:scale-[0.98] sm:inline-flex">
            <BadgeCheck size={16} strokeWidth={1.75} aria-hidden /> Free certificates
          </Link>
          <AccountLink />
        </div>
      </div>
    </header>
  );
}

/** Bottom tab bar on phones and tablets, where the sidebar is hidden. */
export function BottomNav() {
  const path = usePathname();
  const { ids } = useBookmarks();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-line bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden" aria-label="Main">
      {links.map(({ href, label, icon: Icon }) => {
        const on = active(path, href);
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined} className={`relative flex min-w-0 flex-col items-center gap-1 px-0.5 py-2.5 text-[10.5px] font-medium transition-colors ${on ? "text-accent" : "text-muted"}`}>
            <span className={`grid h-7 w-11 place-items-center rounded-full transition-colors ${on ? "bg-accent/[0.08]" : ""}`}>
              <Icon size={20} strokeWidth={on ? 2 : 1.75} aria-hidden />
            </span>
            <span className="max-w-full truncate">{label}</span>
            {href === "/saved" && ids.length > 0 && (
              <span className="absolute right-[calc(50%-22px)] top-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-white" aria-label={`${ids.length} saved`} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function Nav() {
  return (
    <>
      <Sidebar />
      <BottomNav />
    </>
  );
}
