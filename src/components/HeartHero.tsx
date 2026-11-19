"use client";
import { Heart } from "lucide-react";

const ECG = "M0 60 L90 60 L110 60 L125 22 L140 100 L155 60 L205 60 L220 50 L240 70 L255 60 L350 60 L370 60 L385 22 L400 100 L415 60 L465 60 L480 50 L500 70 L515 60 L600 60";
export function EcgLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 120" className={className} fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="none">
      <path d={ECG} pathLength={1} className="ecg-base" />
      <path d={ECG} pathLength={1} stroke="#fb7185" className="ecg-run" />
    </svg>
  );
}

export default function HeartHero() {
  return (
    <div className="relative mx-auto grid h-72 w-72 place-items-center sm:h-96 sm:w-96">
      <span className="absolute h-40 w-40 rounded-full border border-rose-500/40 animate-ring" />
      <span className="absolute h-40 w-40 rounded-full border border-rose-500/30 animate-ring [animation-delay:.8s]" />
      <span className="absolute h-64 w-64 rounded-full bg-rose-500/20 blur-3xl sm:h-80 sm:w-80" />
      <div className="relative animate-float">
        <Heart className="h-36 w-36 animate-beat fill-rose-500 text-rose-400 drop-shadow-[0_0_40px_rgba(244,63,94,.8)] sm:h-48 sm:w-48" strokeWidth={1.2} />
      </div>
      <EcgLine className="absolute inset-x-[-30%] bottom-10 h-24 w-[160%] opacity-90" />
    </div>
  );
}
