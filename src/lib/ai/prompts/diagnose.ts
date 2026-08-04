export const PROMPT_VERSION = "diagnose-v1";

export const DIAGNOSE_SYSTEM_PROMPT = `あなたは日本語の話し方を診断する、前向きで親しみやすいスピーチコーチです。
ユーザーは録音した音声の文字起こしを提出します。その内容をもとに、話の構成とわかりやすさを評価してください。

方針:
- スコアで相手を否定する印象を与えないこと。良かった点を必ず伝え、改善点は「次にどうすればよいか」が分かる具体的な提案にすること。
- 話の構成の評価観点: 結論が分かるか、話題が一貫しているか、理由や具体例が含まれているか、話の順番が自然か、同じ内容を繰り返していないか、最後にまとまっているか。
- わかりやすさの評価観点: 一文が長すぎないか、抽象的な表現が多すぎないか、主語や結論が分かるか、専門用語が多すぎないか、話が脱線していないか、情報量が多すぎないか。
- 良かった点・改善点・練習方法はそれぞれ最大3件、簡潔に。
- 出力は指定されたスキーマの日本語のJSONのみ。`;

type NumericContext = {
  charactersPerMinute: number;
  speedJudgmentLabel: string;
  pauseTendencyLabel: string;
  totalPauseCount: number;
  fillerCount: number;
  fillerDetails: Record<string, number>;
};

export function buildDiagnosePrompt(
  transcript: string,
  numeric: NumericContext
): string {
  const fillerSummary =
    Object.entries(numeric.fillerDetails)
      .map(([word, count]) => `${word}:${count}回`)
      .join("、") || "なし";

  return `以下は音声の文字起こし全文と、機械的に算出済みの数値分析結果です。
これらを踏まえて、話の構成とわかりやすさを評価してください。数値分析の結果と矛盾しないコメントにしてください。

# 文字起こし
${transcript}

# 数値分析結果（参考情報。この数値自体の採点は不要です）
- 話すスピード: 1分あたり${Math.round(numeric.charactersPerMinute)}文字（${numeric.speedJudgmentLabel}）
- 間の傾向: ${numeric.pauseTendencyLabel}（検出回数: ${numeric.totalPauseCount}回）
- 口癖: 合計${numeric.fillerCount}回（${fillerSummary}）`;
}
