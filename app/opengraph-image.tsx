import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0D0D0D",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: "#00AAFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 36,
          }}
        >
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 56 }}>D</span>
        </div>
        <div style={{ display: "flex", color: "#fff", fontSize: 64, fontWeight: 900, letterSpacing: -2 }}>
          Fit con&nbsp;<span style={{ color: "#00AAFF" }}>Damián</span>
        </div>
        <div style={{ color: "#999", fontSize: 28, marginTop: 18 }}>
          Recursos gratuitos de fitness y nutrición
        </div>
      </div>
    ),
    { ...size }
  );
}
