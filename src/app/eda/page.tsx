"use client";
import { Fragment, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, Chip, Reveal, SectionTitle, tooltipStyle } from "@/components/ui";
import { FEATURE_LABELS, R, pct } from "@/lib/results";

const NUM = Object.keys(R.eda.histograms); const CATS = Object.keys(R.eda.categorical);
const heat = (v: number) => { const a = Math.min(Math.abs(v), 1); return v >= 0 ? `rgba(244,63,94,${0.08 + a * 0.85})` : `rgba(56,189,248,${0.08 + a * 0.85})`; };

export default function EdaPage() {
  const [num, setNum] = useState(NUM[0]); const [cat, setCat] = useState(CATS[0]);
  const e = R.eda; const total = e.n_rows;
  const pie = [{ name: "Sain", value: e.class_counts.sain, c: "#38bdf8" }, { name: "Malade", value: e.class_counts.malade, c: "#f43f5e" }];
  const L = e.corr.labels; const target = L.indexOf("HeartDisease");
  return (
    <div className="space-y-12">
      <SectionTitle eyebrow="Phases 2 & 3" title={<>Exploration des <span className="grad-text">données</span></>} sub="Heart Failure Prediction (Kaggle) — fusion de cinq bases dont Cleveland (UCI). Jeu public, de petite taille, mixte (numérique et catégoriel)." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[["Patients", e.n_rows], ["Variables", e.n_features], ["Train / Val / Test", `${e.split.train} / ${e.split.val} / ${e.split.test}`], ["Taux de maladie", pct(e.class_counts.malade / total)]].map(([l, v]) => (
          <Reveal key={l as string}><Card className="text-center"><div className="text-3xl font-extrabold">{v}</div><div className="mt-1 text-sm text-slate-400">{l}</div></Card></Reveal>))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal><Card className="h-full">
          <h3 className="mb-1 font-semibold">Équilibre des classes</h3><p className="mb-2 text-sm text-slate-400">Classes quasi équilibrées : pas besoin de rééchantillonnage (SMOTE).</p>
          <div className="h-64"><ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" innerRadius={62} outerRadius={95} paddingAngle={4} stroke="none" label={({ name, value }) => `${name} ${value}`}>{pie.map((p) => <Cell key={p.name} fill={p.c} />)}</Pie><Tooltip {...tooltipStyle} /></PieChart></ResponsiveContainer></div>
        </Card></Reveal>
        <Reveal delay={0.1}><Card className="h-full">
          <h3 className="mb-1 flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-amber-400" />Anomalies détectées</h3>
          <p className="mb-4 text-sm text-slate-400">Vérifications effectuées avant tout prétraitement.</p>
          <div className="space-y-2">{Object.entries(e.anomalies).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5 text-sm"><span className="flex items-center gap-2 text-slate-300">{v > 0 ? <AlertTriangle className="h-4 w-4 text-amber-400" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}{k}</span>
              <span className={v > 0 ? "font-bold text-amber-300" : "font-bold text-emerald-300"}>{v}</span></div>))}</div>
          <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-xs leading-relaxed text-amber-200/80"><b>Traitement :</b> cholestérol = 0 et tension = 0 sont impossibles physiologiquement → valeurs manquantes déguisées, remplacées par <code>NaN</code> puis imputées par la médiane <b>dans le pipeline</b> (apprise sur le train uniquement).</p>
        </Card></Reveal>
      </div>

      <Reveal><Card>
        <h3 className="mb-1 font-semibold">Distribution des variables numériques par classe</h3>
        <p className="mb-4 text-sm text-slate-400">Les distributions qui diffèrent entre sains et malades sont les plus informatives.</p>
        <div className="mb-4 flex flex-wrap gap-2">{NUM.map((n) => <Chip key={n} active={n === num} onClick={() => setNum(n)}>{FEATURE_LABELS[n]}</Chip>)}</div>
        <div className="h-72"><ResponsiveContainer><BarChart data={e.histograms[num]} barGap={2}><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} /><XAxis dataKey="bin" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} /><Tooltip {...tooltipStyle} cursor={{ fill: "rgba(255,255,255,.04)" }} /><Legend />
          <Bar dataKey="sain" name="Sain" fill="#38bdf8" radius={[6, 6, 0, 0]} /><Bar dataKey="malade" name="Malade" fill="#f43f5e" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-6">{Object.entries(e.describe[num]).map(([k, v]) => (<div key={k} className="rounded-xl bg-white/5 px-3 py-2"><div className="text-slate-500">{k}</div><div className="font-semibold tabular-nums">{v.toFixed(1)}</div></div>))}</div>
      </Card></Reveal>

      <Reveal><Card>
        <h3 className="mb-1 font-semibold">Taux de maladie selon les variables catégorielles</h3>
        <p className="mb-4 text-sm text-slate-400">Par exemple, les patients asymptomatiques (ASY) ou avec une pente ST plate sont bien plus souvent malades.</p>
        <div className="mb-4 flex flex-wrap gap-2">{CATS.map((n) => <Chip key={n} active={n === cat} onClick={() => setCat(n)}>{FEATURE_LABELS[n]}</Chip>)}</div>
        <div className="h-64"><ResponsiveContainer><BarChart data={e.categorical[cat].map((d) => ({ ...d, taux: Math.round(d.rate * 1000) / 10 }))} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid stroke="rgba(255,255,255,.06)" horizontal={false} /><XAxis type="number" domain={[0, 100]} unit="%" stroke="#64748b" fontSize={12} /><YAxis type="category" dataKey="label" stroke="#cbd5e1" fontSize={13} width={70} />
          <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}%`, "Taux de maladie"]} cursor={{ fill: "rgba(255,255,255,.04)" }} /><Bar dataKey="taux" radius={[0, 8, 8, 0]}>{e.categorical[cat].map((d) => <Cell key={d.label} fill={d.rate > 0.65 ? "#f43f5e" : d.rate > 0.4 ? "#fb923c" : "#34d399"} />)}</Bar></BarChart></ResponsiveContainer></div>
      </Card></Reveal>

      <Reveal><Card>
        <h3 className="mb-1 font-semibold">Matrice de corrélation</h3>
        <p className="mb-5 text-sm text-slate-400">Rouge : corrélation positive · Bleu : négative. La dernière ligne montre le lien de chaque variable avec <b>HeartDisease</b>.</p>
        <div className="scroll-thin overflow-x-auto"><div className="grid min-w-[560px] gap-1" style={{ gridTemplateColumns: `110px repeat(${L.length}, minmax(48px,1fr))` }}>
          <div />{L.map((l) => <div key={l} className="truncate pb-1 text-center text-[10px] font-medium text-slate-400" title={l}>{l.replace("ExerciseAngina_Y", "Angine_Y").replace("HeartDisease", "Maladie")}</div>)}
          {e.corr.matrix.map((row, i) => (<Fragment key={L[i]}>
            <div className={`flex items-center text-xs ${i === target ? "font-bold text-rose-300" : "text-slate-400"}`}>{L[i].replace("HeartDisease", "Maladie")}</div>
            {row.map((v, j) => <div key={j} className="grid h-11 place-items-center rounded-md text-[11px] font-semibold tabular-nums transition hover:scale-110" style={{ background: heat(v) }} title={`${L[i]} × ${L[j]} = ${v.toFixed(2)}`}>{v.toFixed(2)}</div>)}</Fragment>))}
        </div></div>
      </Card></Reveal>
    </div>
  );
}
