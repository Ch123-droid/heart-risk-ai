"use client";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Crown, Info, TrendingDown, TrendingUp } from "lucide-react";
import clsx from "clsx";
import { Card, Chip, Reveal, SectionTitle, tooltipStyle } from "@/components/ui";
import { COLORS, FEATURE_LABELS, METRIC_LABELS, MODEL_ORDER, R, pct } from "@/lib/results";

const RANK = R.ranking;

export default function ModelsPage() {
  const [sel, setSel] = useState(R.best); const m = R.models[sel];
  const [tab, setTab] = useState<"test" | "val">("test");
  const metricKeys = ["accuracy", "precision", "recall", "specificity", "f1", "roc_auc"];
  const radar = metricKeys.map((k) => ({ metric: METRIC_LABELS[k], ...Object.fromEntries(MODEL_ORDER.map((id) => [id, +(R.models[id][tab][k as "f1"] * 100).toFixed(1)])) }));
  const roc = R.roc_grid.map((x, i) => ({ fpr: x, ...Object.fromEntries(MODEL_ORDER.map((id) => [id, R.models[id].roc[i]])) }));
  const gen = MODEL_ORDER.map((id) => ({ name: R.models[id].name.replace(" (MLP)", ""), CV: +(R.models[id].cv_mean.f1 * 100).toFixed(1), Validation: +(R.models[id].val.f1 * 100).toFixed(1), Test: +(R.models[id].test.f1 * 100).toFixed(1) }));
  const imp = Object.entries(m.importance).map(([f, v]) => ({ f: FEATURE_LABELS[f], v: Math.max(0, +(v.mean * 100).toFixed(2)) })).sort((a, b) => b.v - a.v);
  const last = m.learning[m.learning.length - 1]; const gap = last.train - last.val;
  const cm = m.test.confusion; const cmTotal = cm.flat().reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-12">
      <SectionTitle eyebrow="Phases 5 à 8" title={<>Comparaison des <span className="grad-text">6 modèles</span></>}
        sub="Chaque modèle est optimisé par RandomizedSearchCV (validation croisée stratifiée à 5 plis sur le train), évalué sur la validation, puis testé une seule fois sur le jeu de test." />

      <Reveal><Card className="!p-0 overflow-hidden">
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead><tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500">
              {["#", "Modèle", "CV F1 (±σ)", "Val F1", "Test Rappel", "Test F1", "Test AUC", "Écart train−val", "Score"].map((h) => <th key={h} className="px-4 py-4 font-semibold">{h}</th>)}</tr></thead>
            <tbody>{RANK.map((id, i) => { const r = R.models[id]; const best = id === R.best; return (
              <tr key={id} onClick={() => setSel(id)} className={clsx("cursor-pointer border-b border-white/5 transition hover:bg-white/5", best && "bg-rose-500/[.07]", sel === id && "outline outline-1 -outline-offset-1 outline-white/20")}>
                <td className="px-4 py-3.5 font-bold text-slate-500">{best ? <Crown className="h-4 w-4 text-amber-400" /> : i + 1}</td>
                <td className="px-4 py-3.5 font-semibold"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLORS[id] }} />{r.name}</td>
                <td className="px-4 py-3.5 tabular-nums">{pct(r.cv_mean.f1)} <span className="text-xs text-slate-500">±{(r.cv_std.f1 * 100).toFixed(1)}</span></td>
                <td className="px-4 py-3.5 tabular-nums">{pct(r.val.f1)}</td>
                <td className="px-4 py-3.5 font-semibold tabular-nums text-rose-300">{pct(r.test.recall)}</td>
                <td className="px-4 py-3.5 tabular-nums">{pct(r.test.f1)}</td>
                <td className="px-4 py-3.5 tabular-nums">{pct(r.test.roc_auc)}</td>
                <td className={clsx("px-4 py-3.5 tabular-nums", r.overfit_gap_f1 > 0.08 ? "text-amber-300" : "text-emerald-300")}>{r.overfit_gap_f1 >= 0 ? "+" : ""}{(r.overfit_gap_f1 * 100).toFixed(1)} pts</td>
                <td className="px-4 py-3.5 font-bold tabular-nums">{(r.selection_score * 100).toFixed(1)}</td></tr>); })}</tbody>
          </table>
        </div>
        <p className="flex items-start gap-2 border-t border-white/10 px-5 py-3 text-xs text-slate-500"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />Score de sélection = moyenne de (rappel, F1, ROC-AUC) : 50 % validation croisée + 50 % validation. Le test n&apos;intervient pas dans le choix. Cliquez sur une ligne pour voir le détail du modèle.</p>
      </Card></Reveal>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal><Card className="h-full">
          <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">Profil de performance</h3>
            <div className="flex gap-1 rounded-full bg-white/5 p-1 text-xs">{(["test", "val"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={clsx("rounded-full px-3 py-1 font-medium", tab === t ? "bg-white/15 text-white" : "text-slate-400")}>{t === "test" ? "Test" : "Validation"}</button>)}</div></div>
          <div className="h-80"><ResponsiveContainer><RadarChart data={radar} outerRadius="75%"><PolarGrid stroke="rgba(255,255,255,.1)" /><PolarAngleAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 12 }} /><PolarRadiusAxis domain={[80, 100]} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} />
            {MODEL_ORDER.map((id) => <Radar key={id} dataKey={id} name={R.models[id].name} stroke={COLORS[id]} fill={COLORS[id]} fillOpacity={id === sel ? 0.25 : 0.03} strokeOpacity={id === sel ? 1 : 0.45} strokeWidth={id === sel ? 2.5 : 1.2} />)}<Tooltip {...tooltipStyle} /></RadarChart></ResponsiveContainer></div>
        </Card></Reveal>
        <Reveal delay={0.1}><Card className="h-full">
          <h3 className="mb-3 font-semibold">Courbes ROC (jeu de test)</h3>
          <div className="h-80"><ResponsiveContainer><LineChart data={roc}><CartesianGrid stroke="rgba(255,255,255,.06)" /><XAxis dataKey="fpr" type="number" domain={[0, 1]} stroke="#64748b" fontSize={11} label={{ value: "Faux positifs", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 11 }} />
            <YAxis domain={[0, 1]} stroke="#64748b" fontSize={11} label={{ value: "Rappel", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 11 }} /><Tooltip {...tooltipStyle} formatter={(v: number) => v.toFixed(3)} />
            <Line dataKey="fpr" name="Hasard" stroke="#475569" strokeDasharray="5 5" dot={false} />
            {MODEL_ORDER.map((id) => <Line key={id} dataKey={id} name={R.models[id].name} stroke={COLORS[id]} dot={false} strokeWidth={id === sel ? 3 : 1.4} strokeOpacity={id === sel ? 1 : 0.5} />)}</LineChart></ResponsiveContainer></div>
        </Card></Reveal>
      </div>

      <Reveal><Card>
        <h3 className="mb-1 font-semibold">Généralisation : F1-score en CV, validation et test</h3>
        <p className="mb-4 text-sm text-slate-400">Des barres de hauteur comparable indiquent un modèle stable, qui généralise bien.</p>
        <div className="h-72"><ResponsiveContainer><BarChart data={gen}><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} /><XAxis dataKey="name" stroke="#94a3b8" fontSize={12} /><YAxis domain={[70, 100]} stroke="#64748b" fontSize={12} unit="%" /><Tooltip {...tooltipStyle} cursor={{ fill: "rgba(255,255,255,.04)" }} /><Legend />
          <Bar dataKey="CV" fill="#a78bfa" radius={[5, 5, 0, 0]} /><Bar dataKey="Validation" fill="#38bdf8" radius={[5, 5, 0, 0]} /><Bar dataKey="Test" fill="#f43f5e" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </Card></Reveal>

      <div>
        <div className="mb-6 flex flex-wrap items-center gap-2"><span className="mr-2 text-sm text-slate-500">Détail du modèle :</span>
          {MODEL_ORDER.map((id) => <Chip key={id} active={sel === id} color={COLORS[id]} onClick={() => setSel(id)}>{R.models[id].name}</Chip>)}</div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <h3 className="mb-4 font-semibold">Matrice de confusion (test)</h3>
            <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-center text-sm">
              <div /><div className="text-xs text-slate-500">Prédit sain</div><div className="text-xs text-slate-500">Prédit malade</div>
              <div className="self-center text-xs text-slate-500 [writing-mode:vertical-rl] rotate-180">Réel sain</div>
              <div className="rounded-2xl bg-emerald-400/15 p-5"><div className="text-3xl font-extrabold text-emerald-300">{cm[0][0]}</div><div className="text-[11px] text-emerald-200/70">Vrais négatifs</div></div>
              <div className="rounded-2xl bg-amber-400/10 p-5"><div className="text-3xl font-extrabold text-amber-300">{cm[0][1]}</div><div className="text-[11px] text-amber-200/70">Faux positifs</div></div>
              <div className="self-center text-xs text-slate-500 [writing-mode:vertical-rl] rotate-180">Réel malade</div>
              <div className="rounded-2xl bg-rose-500/20 p-5 ring-1 ring-rose-400/40"><div className="text-3xl font-extrabold text-rose-300">{cm[1][0]}</div><div className="text-[11px] text-rose-200/70">Faux négatifs ⚠</div></div>
              <div className="rounded-2xl bg-emerald-400/15 p-5"><div className="text-3xl font-extrabold text-emerald-300">{cm[1][1]}</div><div className="text-[11px] text-emerald-200/70">Vrais positifs</div></div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">Sur {cmTotal} patients de test, <b className="text-rose-300">{cm[1][0]}</b> malades n&apos;ont pas été détectés (faux négatifs) : c&apos;est l&apos;erreur la plus grave en dépistage, d&apos;où le choix du <b>rappel ({pct(m.test.recall)})</b> comme métrique prioritaire.</p>
          </Card>
          <Card>
            <h3 className="mb-1 font-semibold">Courbe d&apos;apprentissage</h3><p className="mb-2 text-xs text-slate-500">ROC-AUC selon la taille du jeu d&apos;entraînement (5 plis)</p>
            <div className="h-52"><ResponsiveContainer><LineChart data={m.learning}><CartesianGrid stroke="rgba(255,255,255,.06)" /><XAxis dataKey="n" stroke="#64748b" fontSize={11} /><YAxis domain={[0.8, 1]} stroke="#64748b" fontSize={11} tickFormatter={(v) => v.toFixed(2)} /><Tooltip {...tooltipStyle} formatter={(v: number) => v.toFixed(3)} /><Legend />
              <Line dataKey="train" name="Entraînement" stroke="#a78bfa" strokeWidth={2.5} dot /><Line dataKey="val" name="Validation" stroke="#f43f5e" strokeWidth={2.5} dot /></LineChart></ResponsiveContainer></div>
            <div className={clsx("mt-3 flex items-start gap-2 rounded-xl p-3 text-xs", gap > 0.06 ? "bg-amber-400/10 text-amber-200" : "bg-emerald-400/10 text-emerald-200")}>
              {gap > 0.06 ? <TrendingDown className="mt-0.5 h-4 w-4 shrink-0" /> : <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" />}
              <span>Écart train−validation : <b>{(gap * 100).toFixed(1)} pts</b>. {gap > 0.1 ? "Surapprentissage marqué : le modèle mémorise une partie du train ; la courbe de validation continue de monter avec plus de données." : gap > 0.06 ? "Léger surapprentissage, typique des modèles à base d'arbres sur un petit jeu de données ; la validation reste élevée." : "Bon équilibre biais/variance : le modèle généralise bien."}</span></div>
          </Card>
          <Card>
            <h3 className="mb-1 font-semibold">Importance des variables</h3><p className="mb-2 text-xs text-slate-500">Importance par permutation (baisse d&apos;AUC en points)</p>
            <div className="h-72"><ResponsiveContainer><BarChart data={imp} layout="vertical" margin={{ left: 0 }}><XAxis type="number" stroke="#64748b" fontSize={11} /><YAxis type="category" dataKey="f" width={118} stroke="#cbd5e1" fontSize={11} /><Tooltip {...tooltipStyle} cursor={{ fill: "rgba(255,255,255,.04)" }} />
              <Bar dataKey="v" name="Importance" radius={[0, 6, 6, 0]}>{imp.map((d, i) => <Cell key={d.f} fill={i < 3 ? "#f43f5e" : "#fb923c"} fillOpacity={i < 3 ? 1 : 0.6} />)}</Bar></BarChart></ResponsiveContainer></div>
          </Card>
        </div>
        <Card className="mt-6">
          <h3 className="mb-3 font-semibold">Hyperparamètres retenus — {m.name}</h3>
          <div className="flex flex-wrap gap-2">{Object.entries(m.params).map(([k, v]) => (<span key={k} className="rounded-xl bg-white/5 px-3 py-1.5 font-mono text-xs"><span className="text-slate-500">{k}=</span><span className="text-rose-200">{Array.isArray(v) ? `(${v.join(", ")})` : String(v)}</span></span>))}</div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-6">{metricKeys.map((k) => (<div key={k} className="rounded-2xl bg-white/5 p-3 text-center"><div className="text-xl font-bold tabular-nums">{pct(m.test[k as "f1"])}</div><div className="text-[11px] text-slate-400">{METRIC_LABELS[k]} (test)</div></div>))}</div>
        </Card>
      </div>
    </div>
  );
}
