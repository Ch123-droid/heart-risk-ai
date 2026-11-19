"use client";
import { animate, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("glass rounded-3xl p-5 sm:p-6", className)}>{children}</div>;
}

export function SectionTitle({ eyebrow, title, sub }: { eyebrow?: string; title: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-8">
      {eyebrow && <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">{eyebrow}</div>}
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 max-w-3xl text-slate-400">{sub}</p>}
    </div>
  );
}

export function Counter({ to, decimals = 0, suffix = "", className }: { to: number; decimals?: number; suffix?: string; className?: string }) {
  const [v, setV] = useState(0); const first = useRef(true);
  useEffect(() => {
    const c = animate(first.current ? 0 : v, to, { duration: first.current ? 1.6 : 0.6, ease: "easeOut", onUpdate: (x) => setV(x) });
    first.current = false; return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);
  return <span className={className}>{v.toFixed(decimals)}{suffix}</span>;
}

export function Chip({ active, onClick, children, color }: { active?: boolean; onClick?: () => void; children: React.ReactNode; color?: string }) {
  return (
    <button onClick={onClick} className={clsx("rounded-full border px-4 py-1.5 text-sm font-medium transition",
      active ? "border-transparent text-white" : "border-white/10 text-slate-400 hover:border-white/25 hover:text-white")}
      style={active ? { background: color ?? "linear-gradient(95deg,#f43f5e,#fb923c)" } : undefined}>{children}</button>
  );
}

export const tooltipStyle = {
  contentStyle: { background: "rgba(13,13,22,.95)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, color: "#e5e7eb", fontSize: 12 },
  labelStyle: { color: "#fff", fontWeight: 600 }, itemStyle: { color: "#e5e7eb" },
};
