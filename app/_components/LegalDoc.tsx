import Link from "next/link";
import type { ReactNode } from "react";

export type LegalSection = {
  heading: string;
  body: ReactNode;
};

export default function LegalDoc({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <main style={{ background: "#0D0D0D", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-inter), sans-serif", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "20px 24px", textAlign: "center" }}>
        <Link href="/recursos" style={{ textDecoration: "none" }}>
          <p style={{ margin: 0, fontWeight: 900, fontSize: "18px", letterSpacing: "-0.5px", color: "#fff" }}>
            Fit con <span style={{ color: "#00AAFF" }}>Damián</span>
          </p>
        </Link>
      </header>

      <div style={{ flex: 1, maxWidth: "760px", width: "100%", margin: "0 auto", padding: "48px 24px 72px" }}>

        <h1 style={{ fontSize: "clamp(1.9rem, 6vw, 2.6rem)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 8px 0", letterSpacing: "-1px" }}>
          {title}
        </h1>
        <p style={{ color: "#555", fontSize: "13px", margin: "0 0 40px 0" }}>
          Última actualización: {updated}
        </p>

        {sections.map((s, i) => (
          <section key={i} style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "clamp(1.1rem, 3.5vw, 1.4rem)", fontWeight: 900, color: "#fff", margin: "0 0 14px 0", letterSpacing: "-0.5px" }}>
              {s.heading}
            </h2>
            <div style={{ color: "#A0A0A0", fontSize: "15px", lineHeight: 1.75 }}>
              {s.body}
            </div>
          </section>
        ))}

        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #1f1f1f", display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <Link href="/privacidad" style={{ color: "#00AAFF", fontSize: "13px", textDecoration: "none" }}>Política de Privacidad</Link>
          <Link href="/politica-cookies" style={{ color: "#00AAFF", fontSize: "13px", textDecoration: "none" }}>Política de Cookies</Link>
          <Link href="/aviso-legal" style={{ color: "#00AAFF", fontSize: "13px", textDecoration: "none" }}>Aviso Legal</Link>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1f1f1f", padding: "24px", textAlign: "center" }}>
        <p style={{ color: "#444", fontSize: "12px", margin: 0 }}>
          © {new Date().getFullYear()} VENTO COGITATIVO UNIPESSOAL LDA · fitcondamian.com
        </p>
      </footer>
    </main>
  );
}
