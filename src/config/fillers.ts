export const FILLER_WORDS = [
  "えー",
  "えっと",
  "えーっと",
  "あの",
  "あのー",
  "その",
  "そのー",
  "まあ",
  "なんか",
  "こう",
  "ちょっと",
  "やっぱり",
] as const;

export const FILLER_RATE_THRESHOLDS = {
  // 100文字あたりの口癖出現回数
  lowMaxPer100: 2,
  moderateMaxPer100: 5,
} as const;

export const FILLER_SCORE_POINTS = {
  low: 20,
  moderate: 13,
  high: 7,
} as const;

export function scoreForFillerRate(per100Characters: number): number {
  if (per100Characters <= FILLER_RATE_THRESHOLDS.lowMaxPer100) {
    return FILLER_SCORE_POINTS.low;
  }
  if (per100Characters <= FILLER_RATE_THRESHOLDS.moderateMaxPer100) {
    return FILLER_SCORE_POINTS.moderate;
  }
  return FILLER_SCORE_POINTS.high;
}
