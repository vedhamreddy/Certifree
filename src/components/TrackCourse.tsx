"use client";
import { useEffect } from "react";

/** Privacy-friendly counting: honours Do Not Track and Global Privacy Control, sends no identifiers. */
function allowed() {
  const n = navigator as Navigator & { globalPrivacyControl?: boolean };
  return n.doNotTrack !== "1" && !n.globalPrivacyControl;
}

function send(courseId: string, kind: "view" | "click") {
  if (!allowed()) return;
  const body = JSON.stringify({ courseId, kind });
  if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
    fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
  }
}

/** Counts one view per page load, and clicks on links marked data-track-click. */
export function TrackCourse({ courseId }: { courseId: string }) {
  useEffect(() => {
    send(courseId, "view");
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.("[data-track-click]")) send(courseId, "click");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [courseId]);
  return null;
}
