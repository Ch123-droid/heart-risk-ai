import Link from "next/link";
import { ArrowRight, BarChart3, BrainCircuit, Database, FlaskConical, GitCompare, HeartPulse, Layers, LineChart, Microscope, ShieldCheck, Sparkles, Target, Trophy } from "lucide-react";
import HeartHero, { EcgLine } from "@/components/HeartHero";
import { Card, Counter, Reveal, SectionTitle } from "@/components/ui";
import { R, pct } from "@/lib/results";

const PHASES = [
  { icon: Target, t: "Analyse du besoin", d: "Problème, exigences, métriques" }, { icon: Database, t: "Compréhension des données", d: "918 patients, 11 variables" },
  { icon: Microscope, t: "Analyse exploratoire", d: "Anomalies, déséquilibre, corrélations" }, { icon: Layers, t: "Prétraitement", d: "Pipeline propre, sans fuite" },
  { icon: BrainCircuit, t: "Modélisation", d: "6 algorithmes entraînés" }, { icon: GitCompare, t: "Validation", d: "Train/val/test + validation croisée" },
  { icon: LineChart, t: "Diagnostic", d: "Courbes d'apprentissage, overfitting" }, { icon: FlaskConical, t: "Test final", d: "Matrice de confusion, métriques" },
  { icon: Sparkles, t: "Conclusion", d: "Interprétation, limites, perspectives" },
];

export default function Home() {
  const best = R.models[R.best]; const t = best.test;
  return (
    <div className="space-y-28">
      <section className="grid items-center gap-10 pt-6 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <div className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-slate-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Intelligence artificielle · Dépistage cardiaque
          </div>
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Anticipez le <span className="grad-text">risque cardiaque</span> grâce au machine learning.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-400">
            À partir de 11 mesures cliniques simples, 6 modèles d&apos;IA estiment la probabilité de maladie cardiaque, comparent leurs avis et expliquent leur décision.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/predict" className="btn-primary inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-semibold text-white">Essayer la prédiction <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/models" className="glass inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-semibold hover:bg-white/10"><BarChart3 className="h-4 w-4" /> Voir les résultats</Link>
          </div>
        </div>
        <HeartHero />
      </section>

      <section>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[{ v: R.eda.n_rows, l: "Patients analysés", s: "" }, { v: R.eda.n_features, l: "Variables cliniques", s: "" }, { v: 6, l: "Modèles comparés", s: "" }, { v: t.roc_auc * 100, l: "ROC-AUC (test)", s: "%", d: 1 }].map((s, i) => (
            <Reveal key={s.l} delay={i * 0.08}><Card className="text-center"><div className="grad-text text-4xl font-extrabold sm:text-5xl"><Counter to={s.v} decimals={s.d ?? 0} suffix={s.s} /></div>
              <div className="mt-2 text-sm text-slate-400">{s.l}</div></Card></Reveal>
          ))}
        </div>
      </section>

      <section>
        <Reveal><Card className="relative overflow-hidden !p-0">
          <EcgLine className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full opacity-40" />
          <div className="relative grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-300"><Trophy className="h-3.5 w-3.5" /> Meilleur modèle</div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl"><span className="grad-text">{best.name}</span></h2>
              <p className="mt-4 text-slate-400">Retenu sur la base de la validation croisée et de la validation (rappel, F1, ROC-AUC), puis évalué <b className="text-slate-200">une seule fois</b> sur {R.eda.split.test} patients jamais vus.</p>
              <Link href="/models" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-rose-300 hover:text-rose-200">Comparer les 6 modèles <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[["Rappel", t.recall], ["F1-score", t.f1], ["ROC-AUC", t.roc_auc], ["Précision", t.precision], ["Spécificité", t.specificity], ["Accuracy", t.accuracy]].map(([l, v]) => (
                <div key={l as string} className="rounded-2xl bg-white/5 p-4"><div className="text-2xl font-bold tabular-nums">{pct(v as number)}</div><div className="mt-1 text-xs text-slate-400">{l as string}</div></div>
              ))}
            </div>
          </div>
        </Card></Reveal>
      </section>

      <section>
        <SectionTitle eyebrow="Ce que fait l'application" title={<>Plus qu&apos;un simple <span className="grad-text-cool">score</span></>} />
        <div className="grid gap-4 md:grid-cols-3">
          {[{ i: HeartPulse, t: "Prédiction en direct", d: "Les curseurs et boutons mettent à jour la probabilité instantanément, avec une jauge animée et une catégorie de risque." },
            { i: GitCompare, t: "6 modèles, 1 consensus", d: "Random Forest, Extra Trees, ANN, XGBoost, HistGBM et LightGBM donnent leur avis ; l'application montre l'accord entre eux." },
            { i: ShieldCheck, t: "Explicable & rigoureux", d: "Chaque prédiction détaille les variables qui la déterminent. Pipeline sans fuite de données, validation croisée et test final unique." }].map((f, i) => (
            <Reveal key={f.t} delay={i * 0.1}><Card className="h-full transition hover:-translate-y-1 hover:bg-white/[.07]"><span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-500/30 to-orange-400/20 text-rose-300"><f.i className="h-6 w-6" /></span>
              <h3 className="text-lg font-semibold">{f.t}</h3><p className="mt-2 text-sm leading-relaxed text-slate-400">{f.d}</p></Card></Reveal>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Démarche du projet" title="Les 9 phases du TP" sub="Chaque phase est implémentée dans le notebook Python et illustrée dans cette application." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PHASES.map((p, i) => (
            <Reveal key={p.t} delay={(i % 3) * 0.07}><div className="glass flex items-center gap-4 rounded-2xl p-4">
              <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/5 text-rose-300"><p.icon className="h-5 w-5" />
                <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">{i + 1}</span></div>
              <div><div className="font-semibold">{p.t}</div><div className="text-sm text-slate-400">{p.d}</div></div></div></Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
