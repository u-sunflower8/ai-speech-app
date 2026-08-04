import { transcribe } from "ai";
import { openai } from "@ai-sdk/openai";

export type TranscriptSegment = {
  text: string;
  startSecond: number;
  endSecond: number;
};

export type TranscriptionResult = {
  text: string;
  durationInSeconds: number | undefined;
  segments: TranscriptSegment[];
};

export async function transcribeAudio(
  audio: Uint8Array
): Promise<TranscriptionResult> {
  const result = await transcribe({
    model: openai.transcription("whisper-1"),
    audio,
    providerOptions: {
      openai: {
        // 日本語のみ対応（要件定義書 第8章）。言語を明示すると精度・速度が上がる。
        language: "ja",
        timestampGranularities: ["segment"],
        // 指定しないとWhisperが「えー」「あのー」等の言い淀みを自動的に
        // 除去してしまい、口癖検出の精度が落ちるため明示的に依頼する。
        prompt:
          "えー、あのー、まあ、なんか、といった言い淀みも省略せずすべてそのまま書き起こしてください。",
      },
    },
  });

  return {
    text: result.text,
    durationInSeconds: result.durationInSeconds,
    segments: result.segments,
  };
}
