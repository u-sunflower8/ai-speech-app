import type { TranscriptSegment } from "@/lib/ai/transcribe";

export function calculateSpeakingDurationSec(
  segments: TranscriptSegment[]
): number {
  return segments.reduce((sum, s) => sum + (s.endSecond - s.startSecond), 0);
}

export function calculateCharactersPerMinute(
  characterCount: number,
  speakingDurationSec: number
): number {
  if (speakingDurationSec <= 0) return 0;
  return characterCount / (speakingDurationSec / 60);
}
