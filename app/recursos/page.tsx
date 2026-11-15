import type { Metadata } from "next";
import QuizClient from "./QuizClient";

export const metadata: Metadata = {
  title: "Diagnóstico gratis y plan personalizado",
  description: "Descubre qué está frenando tu cuerpo y recibe gratis tu plan personalizado para volver a verte bien.",
  // Única página pública e indexable del embudo.
  robots: { index: true, follow: true },
};

export default function RecursosPage() {
  return <QuizClient />;
}
