export const SPEED_THRESHOLDS = {
  slowMaxCpm: 250,
  fastMinCpm: 350,
} as const;

export type SpeedJudgment = "slow" | "appropriate" | "fast";

export function judgeSpeed(charactersPerMinute: number): SpeedJudgment {
  if (charactersPerMinute < SPEED_THRESHOLDS.slowMaxCpm) return "slow";
  if (charactersPerMinute > SPEED_THRESHOLDS.fastMinCpm) return "fast";
  return "appropriate";
}

export const SPEED_JUDGMENT_LABEL: Record<SpeedJudgment, string> = {
  slow: "ゆっくり",
  appropriate: "適切",
  fast: "速い",
};

export const SPEED_ADVICE: Record<SpeedJudgment, string> = {
  slow: "もう少しテンポよく話すと、聞き手を飽きさせません。",
  appropriate: "適切なスピードです。このペースを意識して続けましょう。",
  fast: "少しスピードを落として、文末で間を取ると聞き取りやすくなります。",
};

export const SPEED_SCORE_POINTS = {
  appropriate: 20,
  offRange: 12,
} as const;

export function scoreForSpeed(judgment: SpeedJudgment): number {
  return judgment === "appropriate"
    ? SPEED_SCORE_POINTS.appropriate
    : SPEED_SCORE_POINTS.offRange;
}
