import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = "ScamSpotter: Spot the Scam. Stay Safe. Free scam warning-sign checkers and prevention guides.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        background: "#0f1d36",
        color: "#ffffff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <svg width="96" height="96" viewBox="0 0 32 32">
          <path
            d="M16 2.5 4.5 6.8v8.4c0 7.2 4.8 12.6 11.5 14.3 6.7-1.7 11.5-7.1 11.5-14.3V6.8L16 2.5Z"
            fill="#ffffff"
          />
          <circle cx="14.5" cy="14.5" r="5.2" fill="none" stroke="#0f1d36" strokeWidth="2.4" />
          <path d="m18.4 18.4 4.3 4.3" stroke="#3b74f2" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
        <div style={{ fontSize: 64, fontWeight: 700 }}>{SITE.name}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>{SITE.tagline}</div>
        <div style={{ fontSize: 34, color: "#c8d3e6", lineHeight: 1.3 }}>
          Free tools that check messages, emails, job offers and web addresses for common scam warning signs.
        </div>
      </div>
      <div style={{ fontSize: 28, color: "#9aaccb" }}>{SITE.domain}</div>
    </div>,
    size,
  );
}
