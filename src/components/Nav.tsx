"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award, BookOpen, Columns3, Wand2, CalendarClock, Route, Building2, ChevronRight, CircleUserRound, Compass, Heart, LayoutGrid, LogIn, RefreshCw, Search, type LucideIcon,
} from "lucide-react";
import { Logo } from "./Logo";
import { useBookmarks } from "@/lib/bookmarks";
import { useMe } from "@/lib/sync";
import { InstallSidebarItem } from "./InstallApp";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

const links: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "nav.dashboard", icon: LayoutGrid },
  { href: "/courses", label: "nav.browse", icon: Compass },
  { href: "/providers", label: "nav.providers", icon: Building2 },
  { href: "/learning", label: "nav.myCourses", icon: BookOpen },
  { href: "/certificates", label: "nav.certificates", icon: Award },
  { href: "/saved", label: "nav.saved", icon: Heart },
];
const youLinks: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/find", label: "nav.find", icon: Wand2 },
  { href: "/compare", label: "nav.compare", icon: Columns3 },
  { href: "/paths", label: "nav.paths", icon: Route },
  { href: "/deadlines", label: "nav.deadlines", icon: CalendarClock },
  { href: "/account", label: "nav.account", icon: CircleUserRound },
  { href: "/sync", label: "nav.sync", icon: RefreshCw },
];

function active(path: string, href: string) {
  return href === "/" ? path === "/" : path.startsWith(href);
}

/** Sidebar row: round grey icon button; the active row becomes a black pill. */
function NavRow({ href, label, icon: Icon, on, badge }: { href: string; label: string; icon: LucideIcon; on: boolean; badge?: number }) {
  const t = useT();
  return (
    <Link
      href={href}
      aria-current={on ? "page" : undefined}
      className={`group flex items-center gap-3 rounded-full p-1.5 pr-4 text-[15px] font-medium transition-colors duration-150 ${on ? "bg-brand text-white" : "text-muted hover:bg-white hover:text-ink"}`}
    >
      <span className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${on ? "bg-white/15 text-white" : "bg-white text-ink ring-1 ring-inset ring-line group-hover:bg-surface-2"}`}>
        <Icon size={17} strokeWidth={1.75} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 truncate">{t(label)}</span>
      {!!badge && <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${on ? "bg-white text-ink" : "bg-brand text-white"}`}>{badge}</span>}
    </Link>
  );
}

/** Profile card at the bottom of the sidebar. */
function ProfileCard() {
  const me = useMe();
  const t = useT();
  const signedIn = !!me?.signedIn;
  return (
    <Link href={signedIn ? "/account" : "/auth/sign-in?next=/sync"} className="group m-3 flex items-center gap-3 rounded-3xl bg-white p-3 ring-1 ring-inset ring-line transition hover:shadow-lift">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white">
        {signedIn ? <CircleUserRound size={20} strokeWidth={1.75} aria-hidden /> : <LogIn size={18} strokeWidth={1.75} aria-hidden />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink">{signedIn ? t("nav.myAccount") : t("nav.guest")}</span>
        <span className="block truncate text-xs text-muted">{signedIn ? t("nav.synced") : t("nav.signInSync")}</span>
      </span>
      <ChevronRight size={16} strokeWidth={1.75} className="text-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

/** Sidebar on laptops and desktops (lg and up). It sits on the grey page, outside the white shell. */
export function Sidebar() {
  const path = usePathname();
  const { ids } = useBookmarks();
  const t = useT();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col lg:flex">
      <div className="flex h-20 items-center px-6">
        <Link href="/" aria-label="CertiFree home"><Logo /></Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Main">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{t("nav.menu")}</p>
        {links.map((l) => <NavRow key={l.href} {...l} on={active(path, l.href)} badge={l.href === "/saved" ? ids.length : undefined} />)}
        <p className="px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{t("nav.you")}</p>
        {youLinks.map((l) => <NavRow key={l.href} {...l} on={path.startsWith(l.href) || (l.href === "/account" && path.startsWith("/auth"))} />)}
        <InstallSidebarItem />
        <div className="px-1 pt-4"><LanguageSwitcher /></div>
      </nav>
      <ProfileCard />
    </aside>
  );
}

/** Account entry in the top bar. */
function AccountLink() {
  const me = useMe();
  const t = useT();
  if (me?.signedIn) {
    return (
      <Link href="/account" aria-label={t("nav.account")} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-600">
        <CircleUserRound size={18} strokeWidth={1.75} aria-hidden />
      </Link>
    );
  }
  return (
    <Link href="/auth/sign-in?next=/sync" className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-surface-2">
      <LogIn size={16} strokeWidth={1.75} aria-hidden /> <span className="whitespace-nowrap">{t("nav.signIn")}</span>
    </Link>
  );
}

const titles: Record<string, string> = {
  "/": "nav.dashboard", "/courses": "nav.browse", "/providers": "nav.providers", "/learning": "nav.myCourses", "/certificates": "nav.certificates",
  "/saved": "nav.saved", "/paths": "nav.paths", "/find": "nav.find", "/compare": "nav.compare", "/deadlines": "nav.deadlines", "/account": "nav.account", "/sync": "nav.sync", "/auth": "nav.signInPage", "/offline": "nav.offline",
};

/** Top bar inside the white shell. */
export function TopBar() {
  const path = usePathname();
  const t = useT();
  const key = Object.keys(titles).filter((k) => active(path, k)).sort((a, b) => b.length - a.length)[0];
  return (
    <header className="sticky top-0 z-30 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:rounded-t-[28px]">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link href="/" aria-label="CertiFree home" className="lg:hidden"><Logo /></Link>
        <p className="hidden font-display text-2xl font-bold text-ink lg:block">{key ? t(titles[key]) : "CertiFree"}</p>
        <div className="flex flex-1 items-center justify-end gap-2">
          {!path.startsWith("/courses") && (
            <form action="/courses" role="search" className="hidden w-full max-w-xs items-center gap-2 rounded-full bg-surface-2 px-4 transition focus-within:bg-white focus-within:ring-1 focus-within:ring-brand md:flex">
              <Search size={16} strokeWidth={1.75} className="shrink-0 text-muted" aria-hidden />
              <input name="q" placeholder={t("nav.search")} aria-label={t("nav.search")} className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
            </form>
          )}
          <Link href="/courses?cost=free-cert" className="hidden h-10 shrink-0 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-[0.98] sm:inline-flex">
            {t("nav.freeCerts")}
          </Link>
          <div className="lg:hidden"><LanguageSwitcher compact /></div>
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
  const t = useT();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-line bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden" aria-label="Main">
      {links.map(({ href, label, icon: Icon }) => {
        const on = active(path, href);
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined} className={`relative flex min-w-0 flex-col items-center gap-1 px-0 py-2 text-[10px] font-medium tracking-[-0.01em] transition-colors sm:text-[11px] ${on ? "text-ink" : "text-muted"}`}>
            <span className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${on ? "bg-brand text-white" : "bg-surface-2"}`}>
              <Icon size={17} strokeWidth={1.75} aria-hidden />
            </span>
            <span className="max-w-full truncate whitespace-nowrap">{t(label)}</span>
            {href === "/saved" && ids.length > 0 && (
              <span className="absolute right-[calc(50%-20px)] top-1.5 h-2 w-2 rounded-full bg-brand ring-2 ring-white" aria-label={`${ids.length} saved`} />
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
