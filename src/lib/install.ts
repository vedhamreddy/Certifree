"use client";
import { useEffect, useState } from "react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
export type InstallMode = "prompt" | "ios" | "mac-safari" | "android" | "desktop" | "firefox" | "installed";

let deferred: BIPEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BIPEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    listeners.forEach((l) => l());
  });
}

function detect(): InstallMode {
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return "installed";
  if (deferred) return "prompt";
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  if (iOS) return "ios"; // Safari, and Chrome/Edge on iOS 16.4+, all use Share → Add to Home Screen
  if (/Android/.test(ua)) return "android"; // Chrome, Samsung Internet, Edge, Firefox: browser menu
  if (/Firefox\//.test(ua)) return "firefox";
  if (/Safari/.test(ua) && !/Chrome|Chromium|Edg\//.test(ua) && ua.includes("Macintosh")) return "mac-safari";
  return "desktop"; // Chrome/Edge/Opera/Brave on Windows, Mac, Linux, ChromeOS before the prompt is ready
}

/** How this browser can install CertiFree, and a function to start it where the browser allows. */
export function useInstall() {
  const [mode, setMode] = useState<InstallMode>("installed");
  useEffect(() => {
    const update = () => setMode(detect());
    update();
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);
  const install = async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    listeners.forEach((l) => l());
    return outcome === "accepted";
  };
  return { mode, install };
}
