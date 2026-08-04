export const PAUSE_THRESHOLDS = {
  // ギャップがこれ未満なら「間」としてカウントしない（発音の自然な切れ目扱い）
  minPauseSec: 0.3,
  // 平均無音時間がこれ以下なら「短い」傾向
  shortPauseMaxSec: 0.5,
  // 平均無音時間がこれ以上なら「長い」傾向
  longPauseMinSec: 1.5,
} as const;

export type PauseTendency = "short" | "balanced" | "long";

export function judgePauseTendency(averagePauseSec: number): PauseTendency {
  if (averagePauseSec <= PAUSE_THRESHOLDS.shortPauseMaxSec) return "short";
  if (averagePauseSec >= PAUSE_THRESHOLDS.longPauseMinSec) return "long";
  return "balanced";
}

export const PAUSE_TENDENCY_LABEL: Record<PauseTendency, string> = {
  short: "間が短い傾向",
  balanced: "適切な間",
  long: "間が長い傾向",
};

export const PAUSE_ADVICE: Record<PauseTendency, string> = {
  short: "文の区切りでもう少し間を取ると、聞き手が理解しやすくなります。",
  balanced: "間の取り方は適切です。このペースを意識して続けましょう。",
  long: "間が長すぎると間延びした印象になることがあります。テンポを意識しましょう。",
};

export const PAUSE_SCORE_POINTS = {
  balanced: 20,
  offRange: 12,
  // 間が検出できなかった場合（音声が短い等）はデータ不足として中立寄りの点数にする
  noData: 16,
} as const;

export function scoreForPauseTendency(tendency: PauseTendency | null): number {
  if (tendency === null) return PAUSE_SCORE_POINTS.noData;
  return tendency === "balanced"
    ? PAUSE_SCORE_POINTS.balanced
    : PAUSE_SCORE_POINTS.offRange;
}
