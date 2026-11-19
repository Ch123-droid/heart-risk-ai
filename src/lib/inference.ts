import modelsJson from "../data/models.json";
import type { ModelsFile, Patient, Tree, Explanation } from "./types";

const M = modelsJson as unknown as ModelsFile;
export const MODEL_IDS = Object.keys(M.models);
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

/** Transforme un patient en vecteur numérique (même pipeline que sklearn : imputation → standardisation → one-hot). */
export function vectorize(p: Record<string, unknown>): number[] {
  const { num, bin, cat } = M.pre;
  const v: number[] = [];
  num.cols.forEach((c, i) => {
    const raw = typeof p[c] === "number" && !Number.isNaN(p[c] as number) ? (p[c] as number) : num.median[i];
    v.push((raw - num.mean[i]) / num.scale[i]);
  });
  bin.forEach((c) => v.push(Number(p[c])));
  cat.cols.forEach((c, i) => cat.categories[i].forEach((k) => v.push(p[c] === k ? 1 : 0)));
  return v;
}

function walk(t: Tree, x: number[], strict: boolean, f32: boolean): number {
  let i = 0;
  while (t.f[i] !== -1) {
    const xv = f32 ? Math.fround(x[t.f[i]]) : x[t.f[i]];
    const left = strict ? xv < t.t[i] : xv <= t.t[i];
    i = left ? t.l[i] : t.r[i];
  }
  return t.v[i];
}

export function predictVector(id: string, x: number[]): number {
  const m = M.models[id];
  if (m.kind === "forest") {
    let s = 0; for (const t of m.trees) s += walk(t, x, m.strict, m.f32);
    return s / m.trees.length;
  }
  if (m.kind === "gbm") {
    let s = m.base; for (const t of m.trees) s += walk(t, x, m.strict, m.f32);
    return sigmoid(s);
  }
  let h = x;
  m.layers.forEach((L, li) => {
    const out = new Array(L.b.length).fill(0).map((_, j) => L.b[j]);
    for (let i = 0; i < h.length; i++) { const hi = h[i]; if (hi === 0) continue; for (let j = 0; j < out.length; j++) out[j] += hi * L.W[i][j]; }
    h = li < m.layers.length - 1 ? out.map((o) => Math.max(0, o)) : out.map(sigmoid);
  });
  return h[0];
}

export const predictModel = (id: string, p: Record<string, unknown>) => predictVector(id, vectorize(p));
export function predictAll(p: Record<string, unknown>): Record<string, number> {
  const x = vectorize(p); const out: Record<string, number> = {};
  for (const id of MODEL_IDS) out[id] = predictVector(id, x);
  return out;
}

const FEATURES = [...M.pre.num.cols, ...M.pre.bin, ...M.pre.cat.cols];
const score = (ids: string[], p: Record<string, unknown>) => { const x = vectorize(p); return ids.reduce((s, id) => s + predictVector(id, x), 0) / ids.length; };

/**
 * Explication locale (approximation de type Shapley à 2 points). Pour chaque variable f, on moyenne deux effets mesurés
 * contre 40 patients de référence b :
 *  - effet d'ajout   : p(b avec f := valeur du patient) − p(b)  → que change cette valeur chez un patient « moyen » ?
 *  - effet de retrait : p(patient) − p(patient avec f := b[f])   → que perd-on si on neutralise cette valeur ?
 * Contribution > 0 ⇒ la variable augmente le risque ; < 0 ⇒ elle le diminue.
 */
export function explain(p: Patient, ids: string[]): Explanation[] {
  const P = p as unknown as Record<string, unknown>;
  const full = score(ids, P);
  const baseMean = M.background.reduce((s, b) => s + score(ids, b), 0) / M.background.length;
  const out: Explanation[] = FEATURES.map((f) => {
    let add = 0, rem = 0;
    for (const b of M.background) { add += score(ids, { ...b, [f]: P[f] }); rem += score(ids, { ...P, [f]: b[f] }); }
    const n = M.background.length;
    const contribution = ((add / n - baseMean) + (full - rem / n)) / 2;
    const val = P[f];
    return { feature: f, value: val === null || val === undefined ? "inconnu" : String(val), contribution };
  });
  return out.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
}

export const riskLevel = (p: number): "faible" | "modere" | "eleve" => (p < 0.35 ? "faible" : p < 0.65 ? "modere" : "eleve");
export const BEST_MODEL = M.best;
