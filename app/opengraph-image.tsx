import { ImageResponse } from "next/og";
import { site } from "@/content/site-content";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated Open Graph card (shown when the site is shared on social / chat apps).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0D0C0B",
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(205,168,94,0.35), rgba(13,12,11,0) 45%), radial-gradient(circle at 85% 80%, rgba(107,34,50,0.55), rgba(13,12,11,0) 50%)",
          color: "#F4ECDE",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 8, color: "#CDA85E", textTransform: "uppercase", display: "flex" }}>
          {site.locationLine}
        </div>
        <div style={{ fontSize: 96, marginTop: 24, display: "flex" }}>{site.name}</div>
        <div style={{ width: 120, height: 2, background: "#CDA85E", marginTop: 28, display: "flex" }} />
        <div style={{ fontSize: 34, marginTop: 28, color: "#CFC4B2", display: "flex" }}>{site.tagline}</div>
      </div>
    ),
    size,
  );
}
