import type { Metadata } from "next";
import AccesoClient from "./AccesoClient";

export const metadata: Metadata = {
  title: "Tus Recursos Gratuitos",
  robots: { index: false, follow: false },
};

export default function AccesoRecursosPage() {
  return <AccesoClient />;
}
