import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Fit con Damián",
    template: "%s | Fit con Damián",
  },
  description: "Recursos gratuitos de fitness y nutrición para transformar tu cuerpo.",
  metadataBase: new URL("https://fitcondamian.com"),
  // Por defecto NADA se indexa. Solo /recursos lo activa explícitamente.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
