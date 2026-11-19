"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronDown, ShieldCheck, XCircle } from "lucide-react";
import clsx from "clsx";
import { Card, Reveal, SectionTitle } from "@/components/ui";
import { COLORS, R } from "@/lib/results";

const STEPS = [
  { t: "Valeurs impossibles → NaN", d: "Cholestérol = 0 et tension = 0 sont remplacés par des valeurs manquantes (règle déterministe, sans apprentissage)." },
  { t: "Imputation par la médiane", d: "Les NaN des variables numériques sont remplacés par la médiane calculée sur le jeu d'entraînement uniquement." },
  { t: "Standardisation (StandardScaler)", d: "Âge, tension, cholestérol, fréquence max et Oldpeak sont centrés-réduits : (x − μ) / σ. Indispensable pour le réseau de neurones." },
  { t: "Encodage one-hot", d: "Sexe, type de douleur, ECG, angine et pente ST deviennent des colonnes 0/1. Les modalités inconnues sont ignorées." },
  { t: "Variable binaire", d: "FastingBS (0/1) est conservée telle quelle (passthrough)." },
];

const MODELS = [
  { id: "rf", t: "Random Forest", tag: "Bagging d'arbres", p: "Une forêt aléatoire entraîne de nombreux arbres de décision indépendants, chacun sur un échantillon bootstrap des patients et en ne considérant qu'un sous-ensemble aléatoire de variables à chaque découpe. La prédiction finale est la moyenne des probabilités (vote) de tous les arbres. Cette diversité réduit fortement la variance d'un arbre isolé.",
    pros: ["Robuste, peu sensible au surapprentissage", "Gère variables mixtes et non-linéarités", "Importance des variables intégrée"], cons: ["Modèle volumineux et moins lisible", "Souvent un peu moins précis que le boosting"], hp: "n_estimators, max_depth, min_samples_leaf, max_features" },
  { id: "et", t: "Extra Trees", tag: "Arbres extrêmement randomisés", p: "Comme la Random Forest, mais les seuils de découpe sont tirés au hasard au lieu d'être optimisés, et les arbres utilisent par défaut tout l'échantillon (sans bootstrap). Cette randomisation supplémentaire diminue encore la variance, au prix d'un léger biais, et accélère l'entraînement.",
    pros: ["Très rapide à entraîner", "Variance réduite, bon sur petits jeux de données", "Moins de réglages sensibles"], cons: ["Biais légèrement supérieur", "Moins interprétable qu'un arbre unique"], hp: "n_estimators, max_depth, min_samples_leaf, max_features" },
  { id: "ann", t: "ANN (réseau de neurones)", tag: "Perceptron multicouche", p: "Un réseau de neurones artificiels empile des couches de neurones : chaque neurone calcule une somme pondérée de ses entrées puis applique une fonction d'activation (ReLU). La couche de sortie sigmoïde produit une probabilité. Les poids sont appris par rétropropagation du gradient (optimiseur Adam), avec une régularisation L2 (alpha) contre le surapprentissage.",
    pros: ["Modélise des relations non linéaires complexes", "Sortie probabiliste naturelle", "Très flexible (architecture)"], cons: ["Exige la standardisation des données", "Boîte noire, sensible aux hyperparamètres", "Moins à l'aise sur petits jeux tabulaires"], hp: "hidden_layer_sizes, alpha, learning_rate_init" },
  { id: "xgb", t: "XGBoost", tag: "Gradient boosting", p: "Les arbres sont construits séquentiellement : chaque nouvel arbre corrige les erreurs (gradients) des précédents. XGBoost utilise les dérivées d'ordre 1 et 2 de la perte, une régularisation L1/L2 explicite sur les feuilles, le shrinkage (learning_rate) et le sous-échantillonnage des lignes et des colonnes.",
    pros: ["Excellent sur données tabulaires", "Régularisation intégrée", "Gère les valeurs manquantes"], cons: ["Nombreux hyperparamètres", "Risque de surapprentissage si mal réglé"], hp: "n_estimators, max_depth, learning_rate, subsample, colsample_bytree, reg_lambda" },
  { id: "hgb", t: "HistGradientBoosting", tag: "Boosting par histogrammes (scikit-learn)", p: "Version du gradient boosting de scikit-learn inspirée de LightGBM : les variables continues sont d'abord discrétisées en 255 intervalles (histogrammes), ce qui accélère considérablement la recherche des meilleures découpes. Gère nativement les valeurs manquantes et l'arrêt précoce.",
    pros: ["Très rapide, même sur gros jeux", "Natif dans scikit-learn", "Gère NaN et variables catégorielles"], cons: ["Moins de contrôle fin que XGBoost", "Discrétisation = légère perte de précision"], hp: "max_iter, learning_rate, max_depth, l2_regularization, min_samples_leaf" },
  { id: "lgbm", t: "LightGBM", tag: "Boosting leaf-wise (Microsoft)", p: "Boosting par histogrammes avec une croissance des arbres feuille par feuille (leaf-wise) : à chaque étape, on découpe la feuille qui réduit le plus la perte. Plus efficace qu'une croissance niveau par niveau, mais plus sujette au surapprentissage sur peu de données, d'où l'importance de num_leaves et min_child_samples.",
    pros: ["Très rapide et économe en mémoire", "Très précis", "Bon passage à l'échelle"], cons: ["Sensible au surapprentissage sur petits jeux", "Réglage de num_leaves crucial"], hp: "n_estimators, num_leaves, learning_rate, min_child_samples, subsample, reg_lambda" },
];

function Folds() {
  const [k, setK] = useState(0);
  return (
    <div>
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((r) => (
          <button key={r} onClick={() => setK(r)} className="flex w-full items-center gap-3 text-left">
            <span className={clsx("w-16 shrink-0 text-xs font-medium", k === r ? "text-rose-300" : "text-slate-500")}>Itération {r + 1}</span>
            <div className="grid flex-1 grid-cols-5 gap-1.5">
              {[0, 1, 2, 3, 4].map((f) => (<motion.div key={f} layout className={clsx("grid h-9 place-items-center rounded-lg text-[11px] font-semibold",
                f === r ? "bg-gradient-to-r from-rose-500 to-orange-400 text-white shadow-lg shadow-rose-500/30" : "bg-white/[.07] text-slate-400", k !== r && f === r && "opacity-60")}>{f === r ? "Validation" : "Train"}</motion.div>))}
            </div>
            <span className={clsx("w-16 shrink-0 text-right text-xs tabular-nums", k === r ? "text-rose-300" : "text-slate-600")}>score {r + 1}</span>
          </button>))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-3 rounded-2xl bg-white/5 p-3 text-sm"><span className="text-slate-400">Score final =</span>
        <span className="font-mono text-rose-200">(s₁ + s₂ + s₃ + s₄ + s₅) / 5</span><ArrowRight className="h-4 w-4 text-slate-600" /><span className="text-slate-400">moyenne ± écart-type</span></div>
    </div>
  );
}

export default function MethodPage() {
  const [open, setOpen] = useState<string | null>("xgb");
  return (
    <div className="space-y-16">
      <SectionTitle eyebrow="Partie 1" title={<>Méthodologie & <span className="grad-text">théorie</span></>} sub="Pipeline de prétraitement, description des six modèles et de la validation croisée." />

      <section>
        <h2 className="mb-1 text-2xl font-bold">A. Pipeline de prétraitement</h2>
        <p className="mb-6 max-w-3xl text-slate-400">Tout le prétraitement est encapsulé dans un <code className="rounded bg-white/10 px-1.5">Pipeline</code> scikit-learn : il est <b className="text-slate-200">appris uniquement sur les données d&apos;entraînement</b> puis appliqué tel quel à la validation et au test. Aucune information du test ne « fuit » vers l&apos;entraînement (data leakage).</p>
        <div className="grid gap-3 md:grid-cols-5">
          {STEPS.map((s, i) => (<Reveal key={s.t} delay={i * 0.07}><Card className="relative h-full !p-5"><div className="mb-3 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-orange-400 text-sm font-bold text-white">{i + 1}</div>
            <h3 className="mb-1.5 text-sm font-semibold">{s.t}</h3><p className="text-xs leading-relaxed text-slate-400">{s.d}</p></Card></Reveal>))}
        </div>
        <Card className="mt-4 flex items-start gap-3 !p-4 text-sm text-slate-300"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <p>L&apos;application web reproduit <b>exactement</b> ce pipeline en TypeScript (médianes, moyennes, écarts-types et catégories exportés depuis Python), puis exécute les arbres et poids des modèles exportés.</p></Card>
      </section>

      <section>
        <h2 className="mb-1 text-2xl font-bold">B. Description des 6 modèles</h2>
        <p className="mb-6 text-slate-400">Cliquez sur un modèle pour déplier son principe, ses forces, ses limites et ses hyperparamètres.</p>
        <div className="space-y-3">
          {MODELS.map((m) => { const isOpen = open === m.id; const r = R.models[m.id]; return (
            <div key={m.id} className="glass overflow-hidden rounded-3xl">
              <button onClick={() => setOpen(isOpen ? null : m.id)} className="flex w-full items-center gap-4 p-5 text-left">
                <span className="h-10 w-1.5 rounded-full" style={{ background: COLORS[m.id] }} />
                <div className="flex-1"><div className="text-lg font-semibold">{m.t}</div><div className="text-sm text-slate-400">{m.tag}</div></div>
                {r && <div className="hidden text-right sm:block"><div className="text-xs text-slate-500">F1 test</div><div className="font-bold tabular-nums">{(r.test.f1 * 100).toFixed(1)}%</div></div>}
                <ChevronDown className={clsx("h-5 w-5 text-slate-400 transition", isOpen && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>{isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  <div className="space-y-5 border-t border-white/10 p-5 pt-5">
                    <p className="leading-relaxed text-slate-300">{m.p}</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl bg-emerald-400/[.07] p-4"><div className="mb-2 text-sm font-semibold text-emerald-300">Points forts</div><ul className="space-y-1.5 text-sm text-slate-300">{m.pros.map((x) => <li key={x} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{x}</li>)}</ul></div>
                      <div className="rounded-2xl bg-rose-400/[.07] p-4"><div className="mb-2 text-sm font-semibold text-rose-300">Limites</div><ul className="space-y-1.5 text-sm text-slate-300">{m.cons.map((x) => <li key={x} className="flex gap-2"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />{x}</li>)}</ul></div>
                    </div>
                    <div className="text-sm"><span className="text-slate-500">Hyperparamètres clés : </span><span className="font-mono text-xs text-rose-200">{m.hp}</span></div>
                  </div></motion.div>)}</AnimatePresence>
            </div>); })}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-2xl font-bold">C. La validation croisée</h2>
        <p className="mb-6 max-w-3xl text-slate-400">Un seul découpage train/validation donne une estimation de performance dépendante du hasard du tirage, surtout sur un petit jeu (918 patients). La <b className="text-slate-200">validation croisée à k plis</b> (k-fold) réduit cette dépendance.</p>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card><h3 className="mb-4 font-semibold">Principe (k = 5)</h3><Folds /></Card>
          <Card className="space-y-4 text-sm leading-relaxed text-slate-300">
            <h3 className="font-semibold text-white">Comment ça marche ?</h3>
            <ol className="list-decimal space-y-2 pl-5 marker:text-rose-400">
              <li>Le jeu d&apos;entraînement est mélangé puis découpé en <b>k plis</b> de taille égale.</li>
              <li>À chaque itération, le modèle est entraîné sur <b>k−1 plis</b> et évalué sur le pli restant.</li>
              <li>Après k itérations, chaque patient a servi une fois en validation. On rapporte la <b>moyenne ± écart-type</b> des k scores.</li>
            </ol>
            <p><b className="text-rose-300">Stratifiée :</b> chaque pli conserve la proportion de malades (55 %) du jeu complet, ce qui évite des plis déséquilibrés.</p>
            <p><b className="text-rose-300">Usages ici :</b> comparer les modèles, choisir les hyperparamètres (RandomizedSearchCV) et mesurer la stabilité. L&apos;écart-type indique la robustesse : plus il est faible, plus le modèle est régulier.</p>
            <p><b className="text-rose-300">Limites :</b> coût de calcul multiplié par k ; le jeu de test reste indispensable pour l&apos;évaluation finale car la validation croisée sert à choisir (donc devient légèrement optimiste).</p>
          </Card>
        </div>
      </section>
    </div>
  );
}
