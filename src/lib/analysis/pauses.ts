import { PAUSE_THRESHOLDS, judgePauseTendency, type PauseTendency } from "@/config/pauses";
import type { TranscriptSegment } from "@/lib/ai/transcribe";

export type PauseAnalysis = {
  totalPauseCount: number;
  averagePauseDurationSec: number;
  longestPauseDurationSec: number;
  shortPauseCount: number;
  longPauseCount: number;
  tendency: PauseTendency | null;
};

export function analyzePauses(segments: TranscriptSegment[]): PauseAnalysis {
  const gaps: number[] = [];
  for (let i = 1; i < segments.length; i++) {
    const gap = segments[i].startSecond - segments[i - 1].endSecond;
    if (gap >= PAUSE_THRESHOLDS.minPauseSec) {
      gaps.push(gap);
    }
  }

  const totalPauseCount = gaps.length;
  const averagePauseDurationSec =
    totalPauseCount > 0
      ? gaps.reduce((sum, g) => sum + g, 0) / totalPauseCount
      : 0;
  const longestPauseDurationSec = totalPauseCount > 0 ? Math.max(...gaps) : 0;
  const shortPauseCount = gaps.filter(
    (g) => g <= PAUSE_THRESHOLDS.shortPauseMaxSec
  ).length;
  const longPauseCount = gaps.filter(
    (g) => g >= PAUSE_THRESHOLDS.longPauseMinSec
  ).length;
  const tendency =
    totalPauseCount > 0 ? judgePauseTendency(averagePauseDurationSec) : null;

  return {
    totalPauseCount,
    averagePauseDurationSec,
    longestPauseDurationSec,
    shortPauseCount,
    longPauseCount,
    tendency,
  };
}
