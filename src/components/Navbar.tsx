"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HeartPulse, Menu, X } from "lucide-react";
import clsx from "clsx";

const LINKS = [
  { href: "/", label: "Accueil" }, { href: "/predict", label: "Prédire" }, { href: "/eda", label: "Données" },
  { href: "/models", label: "Modèles" }, { href: "/method", label: "Méthode" },
];

export default function Navbar() {
  const path = usePathname(); const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="glass mx-auto mt-3 flex max-w-7xl items-center justify-between rounded-2xl px-4 py-3 sm:mx-6 xl:mx-auto">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-400">
            <HeartPulse className="h-5 w-5 text-white animate-beat" />
          </span>
          <span className="text-lg">Cardio<span className="grad-text">AI</span></span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={clsx("rounded-xl px-4 py-2 text-sm font-medium transition",
              path === l.href ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white")}>{l.label}</Link>
          ))}
        </nav>
        <Link href="/predict" className="btn-primary hidden rounded-xl px-5 py-2 text-sm font-semibold text-white md:block">Lancer une prédiction</Link>
        <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="glass-strong mx-4 mt-2 rounded-2xl p-2 md:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={clsx("block rounded-xl px-4 py-3 text-sm font-medium", path === l.href ? "bg-white/10" : "text-slate-300")}>{l.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
