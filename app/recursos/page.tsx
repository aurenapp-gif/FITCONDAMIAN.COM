import type { Metadata } from "next";
import RecursosClient from "./RecursosClient";

export const metadata: Metadata = {
  title: "Recursos Gratuitos",
  description: "Accede gratis a los recursos que han transformado cientos de cuerpos.",
};

export default function RecursosPage() {
  return <RecursosClient />;
}
