"use client";
import { motion } from "framer-motion";
import { Counter } from "./ui";

const COLOR = { faible: "#34d399", modere: "#fbbf24", eleve: "#f43f5e" } as const;
const LABEL = { faible: "Risque faible", modere: "Risque modéré", eleve: "Risque élevé" } as const;

export default function Gauge({ p, risk }: { p: number; risk: keyof typeof COLOR }) {
  const arc = "M 20 100 A 80 80 0 0 1 180 100";
  const angle = -90 + p * 180;
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <svg viewBox="0 0 200 120" className="w-full overflow-visible">
        <defs>
          <linearGradient id="gg" x1="0" x2="1"><stop offset="0" stopColor="#34d399" /><stop offset=".5" stopColor="#fbbf24" /><stop offset="1" stopColor="#f43f5e" /></linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <path d={arc} stroke="rgba(255,255,255,.08)" strokeWidth="14" strokeLinecap="round" fill="none" />
        <path d={arc} stroke="url(#gg)" strokeWidth="14" strokeLinecap="round" fill="none" opacity=".25" />
        <motion.path d={arc} stroke="url(#gg)" strokeWidth="14" strokeLinecap="round" fill="none" filter="url(#glow)"
          initial={{ pathLength: 0 }} animate={{ pathLength: Math.max(p, 0.015) }} transition={{ type: "spring", stiffness: 60, damping: 16 }} />
        <motion.g style={{ originX: "100px", originY: "100px" }} initial={{ rotate: -90 }} animate={{ rotate: angle }} transition={{ type: "spring", stiffness: 60, damping: 14 }}>
          <line x1="100" y1="100" x2="100" y2="34" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </motion.g>
        <circle cx="100" cy="100" r="7" fill="#0d0d16" stroke="#fff" strokeWidth="2.5" />
        <text x="14" y="116" fill="#64748b" fontSize="8">0%</text><text x="172" y="116" fill="#64748b" fontSize="8">100%</text>
      </svg>
      <div className="-mt-8 text-center">
        <div className="text-6xl font-extrabold tracking-tight" style={{ color: COLOR[risk] }}><Counter to={p * 100} decimals={1} suffix="%" /></div>
        <div className="mt-1 text-sm font-semibold uppercase tracking-widest" style={{ color: COLOR[risk] }}>{LABEL[risk]}</div>
      </div>
    </div>
  );
}
