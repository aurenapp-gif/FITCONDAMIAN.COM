import type { Metadata } from "next";
import "./panel.css";

export const metadata: Metadata = {
  title: { absolute: "Panel FCD" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
  referrer: "no-referrer",
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <div className="pn">{children}</div>;
}
