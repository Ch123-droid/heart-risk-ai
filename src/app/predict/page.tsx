"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertTriangle, Droplets, Gauge as GaugeIcon, HeartPulse, Loader2, Sparkles, Stethoscope, Timer, User, Zap } from "lucide-react";
import clsx from "clsx";
import Gauge from "@/components/Gauge";
import { Card, Chip } from "@/components/ui";
import { COLORS, FEATURE_LABELS, MODEL_ORDER, R, pct } from "@/lib/results";
import type { Patient, PredictResponse } from "@/lib/types";

const PRESETS: Record<string, { label: string; emoji: string; p: Patient }> = {
  sain: { label: "Profil sain", emoji: "🟢", p: { Age: 35, Sex: "F", ChestPainType: "ATA", RestingBP: 118, Cholesterol: 190, FastingBS: 0, RestingECG: "Normal", MaxHR: 172, ExerciseAngina: "N", Oldpeak: 0, ST_Slope: "Up" } },
  limite: { label: "Cas limite", emoji: "🟡", p: { Age: 54, Sex: "M", ChestPainType: "NAP", RestingBP: 135, Cholesterol: 230, FastingBS: 0, RestingECG: "Normal", MaxHR: 135, ExerciseAngina: "N", Oldpeak: 1, ST_Slope: "Flat" } },
  risque: { label: "Profil à risque", emoji: "🔴", p: { Age: 62, Sex: "M", ChestPainType: "ASY", RestingBP: 150, Cholesterol: 270, FastingBS: 1, RestingECG: "ST", MaxHR: 105, ExerciseAngina: "Y", Oldpeak: 2.5, ST_Slope: "Flat" } },
};
const PAIN = [
  { v: "ATA", t: "Angine atypique", d: "Douleur peu liée au cœur" }, { v: "NAP", t: "Non angineuse", d: "Douleur non cardiaque" },
  { v: "TA", t: "Angine typique", d: "Douleur évocatrice" }, { v: "ASY", t: "Asymptomatique", d: "Aucun symptôme ressenti" },
] as const;
const RECO = {
  faible: { t: "Profil plutôt rassurant", d: "Les mesures saisies ne suggèrent pas de maladie cardiaque. Maintenez une bonne hygiène de vie (activité physique, alimentation équilibrée) et des contrôles réguliers.", c: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" },
  modere: { t: "Zone d'incertitude", d: "Le risque est intermédiaire : les modèles sont partagés. Un avis médical et des examens complémentaires (ECG d'effort, bilan lipidique) sont conseillés.", c: "border-amber-400/30 bg-amber-400/10 text-amber-200" },
  eleve: { t: "Risque élevé détecté", d: "Plusieurs indicateurs convergent vers une maladie cardiaque. Une consultation rapide chez un cardiologue pour des examens approfondis est recommandée.", c: "border-rose-400/30 bg-rose-400/10 text-rose-200" },
} as const;

function Slider({ label, unit, value, min, max, step = 1, onChange, hint }: { label: string; unit?: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; hint?: string }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between"><label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-lg font-bold tabular-nums text-white">{value}<span className="ml-1 text-xs font-medium text-slate-500">{unit}</span></span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
function Seg<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { v: T; t: string }[]; onChange: (v: T) => void }) {
  return (
    <div><div className="mb-2 text-sm font-medium text-slate-300">{label}</div>
      <div className="flex gap-1 rounded-2xl bg-white/5 p-1">
        {options.map((o) => (<button key={o.v} onClick={() => onChange(o.v)} className={clsx("flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition",
          value === o.v ? "bg-gradient-to-r from-rose-500 to-orange-400 text-white shadow-lg" : "text-slate-400 hover:text-white")}>{o.t}</button>))}
      </div></div>
  );
}
function Block({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (<Card><div className="mb-5 flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-500/15 text-rose-300"><Icon className="h-4.5 w-4.5" size={18} /></span>
    <h3 className="font-semibold">{title}</h3></div><div className="space-y-5">{children}</div></Card>);
}

export default function PredictPage() {
  const [p, setP] = useState<Patient>(PRESETS.limite.p);
  const [model, setModel] = useState<string>("consensus");
  const [cholUnknown, setCholUnknown] = useState(false);
  const [res, setRes] = useState<(PredictResponse & { best?: string }) | null>(null);
  const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Patient>(k: K, v: Patient[K]) => setP((o) => ({ ...o, [k]: v }));
  const patient = useMemo(() => ({ ...p, Cholesterol: cholUnknown ? null : p.Cholesterol }), [p, cholUnknown]);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      abort.current?.abort(); const ac = new AbortController(); abort.current = ac; setLoading(true);
      try {
        const r = await fetch("/api/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patient, model }), signal: ac.signal });
        const j = await r.json(); if (!r.ok) throw new Error(j.error ?? "Erreur"); setRes(j); setError(null);
      } catch (e) { if ((e as Error).name !== "AbortError") setError((e as Error).message); }
      finally { if (!ac.signal.aborted) setLoading(false); }
    }, 220);
    return () => clearTimeout(t);
  }, [patient, model]);

  const reco = res ? RECO[res.risk] : null;
  const maxC = res ? Math.max(...res.explanation.map((e) => Math.abs(e.contribution)), 0.01) : 1;

  return (
    <div>
      <div className="mb-8">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">Prédiction en temps réel</div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Estimez le <span className="grad-text">risque cardiaque</span></h1>
        <p className="mt-3 max-w-2xl text-slate-400">Modifiez les mesures cliniques : les 6 modèles recalculent instantanément la probabilité et expliquent quelles variables pèsent le plus.</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm text-slate-500">Exemples :</span>
          {Object.entries(PRESETS).map(([k, v]) => (<button key={k} onClick={() => { setP(v.p); setCholUnknown(false); }} className="glass rounded-full px-4 py-1.5 text-sm font-medium hover:bg-white/10">{v.emoji} {v.label}</button>))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-6">
          <Block icon={User} title="Profil du patient">
            <Slider label="Âge" unit="ans" value={p.Age} min={18} max={90} onChange={(v) => set("Age", v)} />
            <Seg label="Sexe" value={p.Sex} options={[{ v: "M", t: "Homme" }, { v: "F", t: "Femme" }]} onChange={(v) => set("Sex", v)} />
          </Block>
          <Block icon={Stethoscope} title="Symptômes">
            <div><div className="mb-2 text-sm font-medium text-slate-300">Type de douleur thoracique</div>
              <div className="grid grid-cols-2 gap-2">{PAIN.map((o) => (
                <button key={o.v} onClick={() => set("ChestPainType", o.v)} className={clsx("rounded-2xl border p-3 text-left transition",
                  p.ChestPainType === o.v ? "border-rose-400/60 bg-rose-500/15" : "border-white/10 bg-white/[.03] hover:border-white/25")}>
                  <div className="text-sm font-semibold">{o.t} <span className="text-xs text-slate-500">({o.v})</span></div><div className="text-xs text-slate-500">{o.d}</div></button>))}</div></div>
            <Seg label="Angine induite par l'effort" value={p.ExerciseAngina} options={[{ v: "N", t: "Non" }, { v: "Y", t: "Oui" }]} onChange={(v) => set("ExerciseAngina", v)} />
          </Block>
          <Block icon={Droplets} title="Mesures biologiques">
            <Slider label="Pression artérielle au repos" unit="mm Hg" value={p.RestingBP ?? 130} min={80} max={200} onChange={(v) => set("RestingBP", v)} />
            <div>
              <div className={clsx(cholUnknown && "opacity-40")}><Slider label="Cholestérol sérique" unit="mg/dl" value={p.Cholesterol ?? 220} min={100} max={600} onChange={(v) => set("Cholesterol", v)} /></div>
              <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-slate-400"><input type="checkbox" checked={cholUnknown} onChange={(e) => setCholUnknown(e.target.checked)} className="accent-rose-500" />
                Valeur inconnue (remplacée par la médiane du jeu d&apos;entraînement)</label>
            </div>
            <Seg label="Glycémie à jeun > 120 mg/dl" value={String(p.FastingBS) as "0" | "1"} options={[{ v: "0", t: "Non" }, { v: "1", t: "Oui" }]} onChange={(v) => set("FastingBS", Number(v) as 0 | 1)} />
          </Block>
          <Block icon={Activity} title="ECG & test d'effort">
            <Seg label="ECG au repos" value={p.RestingECG} options={[{ v: "Normal", t: "Normal" }, { v: "ST", t: "Anomalie ST" }, { v: "LVH", t: "Hypertrophie VG" }]} onChange={(v) => set("RestingECG", v)} />
            <Slider label="Fréquence cardiaque maximale" unit="bpm" value={p.MaxHR} min={60} max={202} onChange={(v) => set("MaxHR", v)} />
            <Slider label="Oldpeak (dépression du segment ST)" value={p.Oldpeak} min={-2} max={6.5} step={0.1} onChange={(v) => set("Oldpeak", Math.round(v * 10) / 10)} />
            <Seg label="Pente du segment ST" value={p.ST_Slope} options={[{ v: "Up", t: "Ascendante" }, { v: "Flat", t: "Plate" }, { v: "Down", t: "Descendante" }]} onChange={(v) => set("ST_Slope", v)} />
          </Block>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="relative overflow-hidden">
            <div className="mb-4 flex flex-wrap gap-2">
              <Chip active={model === "consensus"} onClick={() => setModel("consensus")}><Sparkles className="mr-1 inline h-3.5 w-3.5" />Consensus</Chip>
              {MODEL_ORDER.map((m) => (<Chip key={m} active={model === m} color={COLORS[m]} onClick={() => setModel(m)}>{R.models[m].name}</Chip>))}
            </div>
            {error ? (<div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-4 text-sm text-rose-300"><AlertTriangle className="h-4 w-4" />{error}</div>) : res ? (
              <>
                <div className={clsx("transition-opacity", loading && "opacity-60")}><Gauge p={res.probability} risk={res.risk} /></div>
                <div className="mt-2 flex items-center justify-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><HeartPulse className="h-3.5 w-3.5" />{res.votes}/{res.total} modèles prédisent « maladie »</span>
                  <span className="flex items-center gap-1"><Timer className="h-3.5 w-3.5" />{res.ms} ms</span>
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                </div>
                <AnimatePresence mode="wait">
                  {reco && (<motion.div key={res.risk} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={clsx("mt-5 rounded-2xl border p-4 text-sm", reco.c)}><div className="mb-1 font-semibold">{reco.t}</div><p className="opacity-90">{reco.d}</p></motion.div>)}
                </AnimatePresence>
              </>
            ) : (<div className="grid h-64 place-items-center text-slate-500"><Loader2 className="animate-spin" /></div>)}
          </Card>

          {res && (
            <Card>
              <div className="mb-4 flex items-center gap-2 font-semibold"><GaugeIcon className="h-4 w-4 text-rose-300" />Probabilité par modèle</div>
              <div className="space-y-3">
                {MODEL_ORDER.map((m) => { const v = res.probabilities[m]; return (
                  <div key={m}><div className="mb-1 flex justify-between text-xs"><span className="text-slate-300">{R.models[m].name}{res.best === m && <span className="ml-2 rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300">MEILLEUR</span>}</span><span className="font-semibold tabular-nums">{pct(v)}</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full rounded-full" style={{ background: COLORS[m] }} animate={{ width: `${v * 100}%` }} transition={{ type: "spring", stiffness: 90, damping: 18 }} /></div></div>); })}
              </div>
            </Card>
          )}

          {res && (
            <Card>
              <div className="mb-1 flex items-center gap-2 font-semibold"><Zap className="h-4 w-4 text-rose-300" />Pourquoi ce résultat ?</div>
              <p className="mb-4 text-xs text-slate-500">Impact de chaque variable (en points de probabilité) comparé à un patient moyen. <span className="text-rose-300">Rouge</span> = augmente le risque, <span className="text-emerald-300">vert</span> = le diminue.</p>
              <div className="space-y-2.5">
                {res.explanation.slice(0, 7).map((e) => { const pos = e.contribution >= 0; const w = (Math.abs(e.contribution) / maxC) * 50; return (
                  <div key={e.feature} className="grid grid-cols-[120px_1fr_52px] items-center gap-2 text-xs">
                    <div className="truncate text-slate-300" title={FEATURE_LABELS[e.feature]}>{FEATURE_LABELS[e.feature]}<span className="block text-[10px] text-slate-500">{e.value}</span></div>
                    <div className="relative h-3 rounded-full bg-white/5"><div className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
                      <motion.div className={clsx("absolute inset-y-0 rounded-full", pos ? "bg-gradient-to-r from-rose-500 to-orange-400" : "bg-gradient-to-l from-emerald-400 to-teal-400")}
                        style={pos ? { left: "50%" } : { right: "50%" }} animate={{ width: `${w}%` }} transition={{ type: "spring", stiffness: 90, damping: 18 }} /></div>
                    <div className={clsx("text-right font-semibold tabular-nums", pos ? "text-rose-300" : "text-emerald-300")}>{pos ? "+" : ""}{(e.contribution * 100).toFixed(1)}</div>
                  </div>); })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
