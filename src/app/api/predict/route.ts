import { NextResponse } from "next/server";
import { BEST_MODEL, MODEL_IDS, explain, predictAll, riskLevel } from "@/lib/inference";
import type { Patient, PredictResponse } from "@/lib/types";

export const runtime = "nodejs";

const RANGES: Record<string, [number, number]> = { Age: [18, 100], RestingBP: [60, 260], Cholesterol: [50, 700], MaxHR: [50, 230], Oldpeak: [-3, 8] };
const ENUMS: Record<string, string[]> = { Sex: ["M", "F"], ChestPainType: ["ATA", "NAP", "ASY", "TA"], RestingECG: ["Normal", "ST", "LVH"], ExerciseAngina: ["Y", "N"], ST_Slope: ["Up", "Flat", "Down"] };

function validate(p: Record<string, unknown>): string | null {
  for (const [k, [lo, hi]] of Object.entries(RANGES)) {
    const v = p[k];
    if ((k === "RestingBP" || k === "Cholesterol") && (v === null || v === undefined)) continue; // valeur inconnue → imputée par la médiane
    if (typeof v !== "number" || Number.isNaN(v) || v < lo || v > hi) return `${k} doit être un nombre entre ${lo} et ${hi}`;
  }
  for (const [k, allowed] of Object.entries(ENUMS)) if (!allowed.includes(p[k] as string)) return `${k} invalide`;
  if (p.FastingBS !== 0 && p.FastingBS !== 1) return "FastingBS doit valoir 0 ou 1";
  return null;
}

export async function POST(req: Request) {
  const t0 = performance.now();
  let body: { patient?: Record<string, unknown>; model?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }
  const patient = body.patient ?? {};
  const err = validate(patient);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const selected = body.model && MODEL_IDS.includes(body.model) ? body.model : "consensus";
  const probabilities = predictAll(patient);
  const consensus = MODEL_IDS.reduce((s, id) => s + probabilities[id], 0) / MODEL_IDS.length;
  const probability = selected === "consensus" ? consensus : probabilities[selected];
  const votes = MODEL_IDS.filter((id) => probabilities[id] >= 0.5).length;
  const explanation = explain(patient as unknown as Patient, selected === "consensus" ? MODEL_IDS : [selected]);

  const res: PredictResponse = { probabilities, consensus, votes, total: MODEL_IDS.length, risk: riskLevel(probability), explanation, selected, probability, ms: Math.round(performance.now() - t0) };
  return NextResponse.json({ ...res, best: BEST_MODEL });
}
