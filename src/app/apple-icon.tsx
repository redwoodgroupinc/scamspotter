import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      <svg width="150" height="150" viewBox="0 0 32 32">
        <path d="M16 2.5 4.5 6.8v8.4c0 7.2 4.8 12.6 11.5 14.3 6.7-1.7 11.5-7.1 11.5-14.3V6.8L16 2.5Z" fill="#0f1d36" />
        <circle cx="14.5" cy="14.5" r="5.2" fill="none" stroke="#ffffff" strokeWidth="2.4" />
        <path d="m18.4 18.4 4.3 4.3" stroke="#3b74f2" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    </div>,
    size,
  );
}
