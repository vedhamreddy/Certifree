import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://certifree.vedhamreddym.workers.dev").replace(/\/$/, "");

/** Share card in the CertiFree look: white card, black type, a monochrome chip. */
export function ogCard({ eyebrow, title, chip, footer }: { eyebrow: string; title: string; chip?: string; footer?: string }) {
  const size = title.length > 90 ? 50 : title.length > 55 ? 60 : 72;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ededed", padding: 36 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff", borderRadius: 40, padding: "56px 64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 999, background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, color: "#0a0a0a" }}>CertiFree</div>
            <div style={{ marginLeft: "auto", fontSize: 26, color: "#6b6b6b" }}>{eyebrow}</div>
          </div>
          <div style={{ display: "flex", fontSize: size, fontWeight: 700, color: "#0a0a0a", lineHeight: 1.1, letterSpacing: -1.5 }}>{title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {chip && <div style={{ display: "flex", background: "#0a0a0a", color: "#fff", borderRadius: 999, padding: "12px 26px", fontSize: 28, fontWeight: 600 }}>{chip}</div>}
            <div style={{ fontSize: 26, color: "#6b6b6b" }}>{footer ?? "Every free certification in one place"}</div>
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
