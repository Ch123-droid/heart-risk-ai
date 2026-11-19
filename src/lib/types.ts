export type Patient = {
  Age: number; Sex: "M" | "F"; ChestPainType: "ATA" | "NAP" | "ASY" | "TA";
  RestingBP: number | null; Cholesterol: number | null; FastingBS: 0 | 1;
  RestingECG: "Normal" | "ST" | "LVH"; MaxHR: number; ExerciseAngina: "Y" | "N";
  Oldpeak: number; ST_Slope: "Up" | "Flat" | "Down";
};
export type Tree = { f: number[]; t: number[]; l: number[]; r: number[]; v: number[] };
export type ModelExport =
  | { kind: "forest"; strict: boolean; f32: boolean; trees: Tree[] }
  | { kind: "gbm"; strict: boolean; f32: boolean; base: number; trees: Tree[] }
  | { kind: "mlp"; layers: { W: number[][]; b: number[] }[] };
export type PreInfo = {
  num: { cols: string[]; median: number[]; mean: number[]; scale: number[] };
  bin: string[]; cat: { cols: string[]; categories: string[][] }; feature_names: string[];
};
export type ModelsFile = { pre: PreInfo; models: Record<string, ModelExport>; background: Record<string, number | string | null>[]; best: string };

export interface Metrics { accuracy: number; precision: number; recall: number; specificity: number; f1: number; roc_auc: number; confusion: number[][] }
export interface ModelResult {
  id: string; name: string; params: Record<string, unknown>;
  cv_mean: Record<string, number>; cv_std: Record<string, number>; cv_train: Record<string, number>; cv_folds: Record<string, number[]>;
  train: Metrics; val: Metrics; test: Metrics;
  learning: { n: number; train: number; val: number; val_std: number }[];
  importance: Record<string, { mean: number; std: number }>;
  roc: number[]; overfit_gap_f1: number; selection_score: number; fit_seconds: number;
}
export interface Results {
  best: string; ranking: string[]; generated: string; roc_grid: number[]; features: string[];
  models: Record<string, ModelResult>;
  eda: {
    n_rows: number; n_features: number; class_counts: { sain: number; malade: number }; anomalies: Record<string, number>;
    split: { train: number; val: number; test: number };
    describe: Record<string, Record<string, number>>;
    histograms: Record<string, { bin: string; sain: number; malade: number }[]>;
    categorical: Record<string, { label: string; total: number; malade: number; rate: number }[]>;
    corr: { labels: string[]; matrix: number[][] };
    dev_median: Record<string, number>;
  };
}
export type Explanation = { feature: string; value: string; contribution: number };
export type PredictResponse = {
  probabilities: Record<string, number>; consensus: number; votes: number; total: number;
  risk: "faible" | "modere" | "eleve"; explanation: Explanation[]; selected: string; probability: number; ms: number;
};
