import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        background: "#0D0D0D",
        minHeight: "100vh",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        fontFamily: "var(--font-inter), sans-serif",
      }}
    >
      <p style={{ color: "#00AAFF", fontWeight: 900, fontSize: "80px", margin: "0 0 8px 0", letterSpacing: "-2px" }}>
        404
      </p>
      <h1 style={{ fontWeight: 900, fontSize: "clamp(1.6rem, 5vw, 2.2rem)", margin: "0 0 12px 0", letterSpacing: "-0.5px" }}>
        Esta página no existe
      </h1>
      <p style={{ color: "#888", fontSize: "15px", margin: "0 0 32px 0", maxWidth: "420px", lineHeight: 1.6 }}>
        Puede que el enlace esté roto o que la página se haya movido.
      </p>
      <Link
        href="/recursos"
        style={{
          display: "inline-block",
          background: "#00AAFF",
          color: "#fff",
          fontWeight: 900,
          fontSize: "15px",
          padding: "14px 32px",
          borderRadius: "99px",
          textDecoration: "none",
        }}
      >
        Ir a recursos gratuitos →
      </Link>
    </main>
  );
}
