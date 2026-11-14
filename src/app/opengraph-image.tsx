import { ogCard, OG_SIZE } from "@/lib/og";

export const alt = "CertiFree: every free certification in one place";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({ eyebrow: "Free courses and certificates", title: "Every free certification, in one place.", chip: "Google · Microsoft · AWS · IBM · NPTEL", footer: "" });
}
