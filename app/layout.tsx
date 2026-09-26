import type { Metadata, Viewport } from "next";
import { Inter, Sora, Fraunces, Montserrat, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Tipografía de los logotipos ("fitcondamián" y "envejecimiento revertido.").
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "800"],
});

// Tipografía editorial (titulares serif de la landing VSL).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

// Tipografía del titular de la landing VSL.
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

// Tipografía de la franja superior de la landing VSL.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["800"],
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
  themeColor: "#081521",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${sora.variable} ${fraunces.variable} ${montserrat.variable} ${instrument.variable}`}>
      <link rel="preconnect" href="https://links.fitcondamian.com" />
      <link rel="dns-prefetch" href="https://links.fitcondamian.com" />
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
