import { FILLER_WORDS } from "@/config/fillers";

export type FillerAnalysis = {
  totalCount: number;
  counts: Record<string, number>;
  per100Characters: number;
};

export function analyzeFillers(
  transcript: string,
  characterCount: number
): FillerAnalysis {
  const counts: Record<string, number> = {};
  // Longest word first so "えーっと" isn't also double-counted as "えー".
  const sortedWords = [...FILLER_WORDS].sort((a, b) => b.length - a.length);
  let remaining = transcript;

  for (const word of sortedWords) {
    // Japanese has no spaces between words, so a bare substring match false
    // -positives inside ordinary vocabulary (e.g. "こう" inside the verb
    // "行こう"). Genuine disfluencies are almost always rendered by Whisper
    // with a pause marker right after them, so require the match to be
    // followed by punctuation or the end of the string.
    const regex = new RegExp(`${escapeRegExp(word)}(?=[、。!?！?]|$)`, "g");
    const count = remaining.match(regex)?.length ?? 0;
    if (count > 0) {
      counts[word] = count;
      // Mask matched spans so shorter words nested inside a longer match
      // (e.g. "えー" inside "えーっと") aren't recounted.
      remaining = remaining.split(word).join(" ".repeat(word.length));
    }
  }

  const totalCount = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const per100Characters =
    characterCount > 0 ? (totalCount / characterCount) * 100 : 0;

  return { totalCount, counts, per100Characters };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
