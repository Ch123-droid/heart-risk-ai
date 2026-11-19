import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "CardioAI — Prédiction du risque de maladie cardiaque",
  description: "Application d'intelligence artificielle : 6 modèles de machine learning comparés pour estimer le risque de maladie cardiaque.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-24 sm:px-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
