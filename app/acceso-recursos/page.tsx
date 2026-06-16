import type { Metadata } from "next";
import AccesoRecursosClient from "./AccesoRecursosClient";

export const metadata: Metadata = {
  title: "Tus Recursos Gratuitos",
  robots: { index: false, follow: false },
};

export default function AccesoRecursosPage() {
  return <AccesoRecursosClient />;
}
