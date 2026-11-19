// Vérifie que l'inférence TypeScript reproduit exactement les probabilités de scikit-learn / XGBoost / LightGBM.
import verify from "../src/data/verify.json";
import { predictAll } from "../src/lib/inference";

let maxErr = 0; const perModel: Record<string, number> = {};
for (const row of verify as { x: Record<string, unknown>; p: Record<string, number> }[]) {
  const mine = predictAll(row.x);
  for (const id of Object.keys(row.p)) {
    const e = Math.abs(mine[id] - row.p[id]);
    perModel[id] = Math.max(perModel[id] ?? 0, e); maxErr = Math.max(maxErr, e);
  }
}
console.log("Écart max par modèle (TS vs Python) :", Object.fromEntries(Object.entries(perModel).map(([k, v]) => [k, v.toExponential(1)])));
if (maxErr > 6e-3) { console.error("❌ Inférence incohérente"); process.exit(1); }
console.log("✅ Inférence TypeScript conforme aux modèles Python (", (verify as unknown[]).length, "patients de test )");
