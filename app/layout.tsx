import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const description = "Recursos gratuitos de fitness y nutrición para transformar tu cuerpo.";

export const metadata: Metadata = {
  title: {
    default: "Fit con Damián",
    template: "%s | Fit con Damián",
  },
  description,
  metadataBase: new URL("https://fitcondamian.com"),
  // Por defecto NADA se indexa. Solo /recursos lo activa explícitamente.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Fit con Damián",
    title: "Fit con Damián",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Fit con Damián",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0D0D0D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://links.fitcondamian.com" />
        <link rel="dns-prefetch" href="https://links.fitcondamian.com" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
