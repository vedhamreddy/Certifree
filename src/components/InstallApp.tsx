"use client";
import { useEffect, useState } from "react";
import { Download, EllipsisVertical, MonitorDown, Share, SquarePlus, X } from "lucide-react";
import { useInstall, type InstallMode } from "@/lib/install";

const DISMISS = "certifree:install-dismissed";
const ic = "inline text-accent align-[-3px]";

/** Short, platform-specific install steps. */
function Steps({ mode }: { mode: InstallMode }) {
  const li = "leading-relaxed";
  switch (mode) {
    case "ios":
      return (
        <ol className="mt-1 space-y-0.5 text-sm text-muted">
          <li className={li}>1. Tap <Share size={15} strokeWidth={1.75} className={ic} aria-label="Share" /> Share</li>
          <li className={li}>2. Tap <SquarePlus size={15} strokeWidth={1.75} className={ic} aria-hidden /> <b className="font-semibold text-ink">Add to Home Screen</b></li>
        </ol>
      );
    case "android":
      return (
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Open the browser menu <EllipsisVertical size={15} strokeWidth={1.75} className={ic} aria-label="menu" /> and tap <b className="font-semibold text-ink">Install app</b> or <b className="font-semibold text-ink">Add to Home screen</b>.
        </p>
      );
    case "mac-safari":
      return <p className="mt-1 text-sm leading-relaxed text-muted">In the menu bar, choose <b className="font-semibold text-ink">File → Add to Dock</b>.</p>;
    case "desktop":
      return (
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Click the install icon <MonitorDown size={15} strokeWidth={1.75} className={ic} aria-hidden /> at the right of the address bar, or open the browser menu and choose <b className="font-semibold text-ink">Install CertiFree</b>.
        </p>
      );
    case "firefox":
      return <p className="mt-1 text-sm leading-relaxed text-muted">Firefox can&apos;t install web apps on computers. Open CertiFree in Chrome, Edge or Safari to install it.</p>;
    default:
      return null;
  }
}

/** Sidebar entry (laptops and desktops). Hidden once installed. */
export function InstallSidebarItem() {
  const { mode, install } = useInstall();
  const [help, setHelp] = useState(false);
  if (mode === "installed") return null;
  return (
    <div>
      <button
        type="button"
        onClick={() => (mode === "prompt" ? install() : setHelp((v) => !v))}
        aria-expanded={mode === "prompt" ? undefined : help}
        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-medium text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-ink"
      >
        <Download size={18} strokeWidth={1.75} className="text-muted transition-colors group-hover:text-ink" aria-hidden />
        Install app
      </button>
      {help && mode !== "prompt" && <div className="mx-3 mb-2 rounded-xl border border-line bg-surface-2 p-3"><Steps mode={mode} /></div>}
    </div>
  );
}

/** One-time card above the tab bar on phones and tablets. Dismissal is remembered on this device. */
export function InstallBanner() {
  const { mode, install } = useInstall();
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    try {
      setHidden(localStorage.getItem(DISMISS) === "1");
    } catch {
      setHidden(false);
    }
  }, []);
  if (hidden || mode === "installed" || mode === "firefox") return null;
  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS, "1");
    } catch {}
    setHidden(true);
  };
  return (
    <div className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-md lg:hidden">
      <div className="sheet-in flex items-start gap-3 rounded-2xl border border-line bg-white p-4 shadow-pop">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">Install CertiFree</p>
          {mode === "prompt" ? <p className="mt-0.5 text-sm text-muted">Open it from your home screen, full screen, even offline.</p> : <Steps mode={mode} />}
          {mode === "prompt" && (
            <button type="button" onClick={async () => { if (await install()) dismiss(); }} className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3 text-sm font-semibold text-white transition hover:bg-brand-600">
              <Download size={15} strokeWidth={1.75} aria-hidden /> Install
            </button>
          )}
        </div>
        <button type="button" onClick={dismiss} aria-label="Dismiss" className="rounded-lg p-1.5 text-muted transition hover:bg-surface-2 hover:text-ink"><X size={16} strokeWidth={1.75} aria-hidden /></button>
      </div>
    </div>
  );
}
