import raw from "../data/results.json";
import type { Results } from "./types";
export const R = raw as unknown as Results;
export const MODEL_ORDER = ["xgb", "lgbm", "hgb", "rf", "et", "ann"].filter((k) => k in R.models);
export const COLORS: Record<string, string> = { rf: "#34d399", et: "#a3e635", ann: "#c084fc", xgb: "#fb7185", hgb: "#38bdf8", lgbm: "#fbbf24" };
export const METRIC_LABELS: Record<string, string> = { accuracy: "Accuracy", precision: "Précision", recall: "Rappel", specificity: "Spécificité", f1: "F1-score", roc_auc: "ROC-AUC" };
export const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;
export const FEATURE_LABELS: Record<string, string> = {
  Age: "Âge", Sex: "Sexe", ChestPainType: "Douleur thoracique", RestingBP: "Tension au repos", Cholesterol: "Cholestérol", FastingBS: "Glycémie à jeun",
  RestingECG: "ECG au repos", MaxHR: "Fréq. cardiaque max", ExerciseAngina: "Angine à l'effort", Oldpeak: "Oldpeak (ST)", ST_Slope: "Pente ST",
};
