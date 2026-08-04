import { NextResponse } from "next/server";
import { NoTranscriptGeneratedError, NoObjectGeneratedError } from "ai";
import { createClient } from "@/lib/supabase/server";
import { AUDIO_CONSTRAINTS, getAudioExtension, isAllowedAudioExtension } from "@/config/audio";
import { transcribeAudio } from "@/lib/ai/transcribe";
import { analyzeFillers } from "@/lib/analysis/fillers";
import { analyzePauses } from "@/lib/analysis/pauses";
import { calculateCharactersPerMinute, calculateSpeakingDurationSec } from "@/lib/analysis/speed";
import { judgeSpeed, SPEED_JUDGMENT_LABEL, scoreForSpeed } from "@/config/speed";
import { PAUSE_TENDENCY_LABEL, scoreForPauseTendency } from "@/config/pauses";
import { scoreForFillerRate } from "@/config/fillers";
import { diagnoseWithAI, DIAGNOSE_MODEL } from "@/lib/ai/diagnose";
import { PROMPT_VERSION } from "@/lib/ai/prompts/diagnose";

function toUserFacingErrorMessage(error: unknown): string {
  if (NoTranscriptGeneratedError.isInstance(error)) {
    return "音声から言葉を検出できませんでした。無音や雑音のみの可能性があります。もう一度録音してみてください。";
  }
  return "文字起こし処理に失敗しました。時間をおいてもう一度お試しください。";
}

function toAiDiagnoseErrorMessage(error: unknown): string {
  if (NoObjectGeneratedError.isInstance(error)) {
    return "AI診断の生成に失敗しました。文字起こし・数値分析の結果は保存されています。";
  }
  return "AI診断に失敗しました。文字起こし・数値分析の結果は保存されています。";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const title = formData.get("title");
  const durationRaw = formData.get("durationSec");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "音声ファイルが見つかりません。" }, { status: 400 });
  }

  const extension = getAudioExtension(file.name);
  if (!isAllowedAudioExtension(extension)) {
    return NextResponse.json(
      {
        error: `対応していない音声形式です（${AUDIO_CONSTRAINTS.allowedExtensions.join(", ")} のみ対応）。`,
      },
      { status: 400 }
    );
  }

  if (file.size > AUDIO_CONSTRAINTS.maxFileSizeBytes) {
    return NextResponse.json(
      {
        error: `ファイルサイズが上限（${AUDIO_CONSTRAINTS.maxFileSizeBytes / (1024 * 1024)}MB）を超えています。`,
      },
      { status: 400 }
    );
  }

  const durationSec = Number(durationRaw);
  if (
    !Number.isFinite(durationSec) ||
    durationSec < AUDIO_CONSTRAINTS.minDurationSec ||
    durationSec > AUDIO_CONSTRAINTS.maxDurationSec
  ) {
    return NextResponse.json(
      {
        error: `音声の長さは${AUDIO_CONSTRAINTS.minDurationSec}秒〜${AUDIO_CONSTRAINTS.maxDurationSec}秒にしてください。`,
      },
      { status: 400 }
    );
  }

  const diagnosisId = crypto.randomUUID();
  const audioPath = `${user.id}/${diagnosisId}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("audio-recordings")
    .upload(audioPath, arrayBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: "音声のアップロードに失敗しました。" }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("diagnoses").insert({
    id: diagnosisId,
    user_id: user.id,
    title: typeof title === "string" && title.trim() ? title.trim() : null,
    status: "pending",
    audio_path: audioPath,
    audio_duration: durationSec,
  });

  if (insertError) {
    await supabase.storage.from("audio-recordings").remove([audioPath]);
    return NextResponse.json({ error: "診断データの保存に失敗しました。" }, { status: 500 });
  }

  // 音声・行の保存はここまでで完了。以降の文字起こし・数値分析が失敗しても
  // アップロードのやり直しが不要なよう、失敗はstatus='failed'として記録するのみ。
  try {
    await supabase.from("diagnoses").update({ status: "processing" }).eq("id", diagnosisId);

    const { text, segments } = await transcribeAudio(new Uint8Array(arrayBuffer));

    const characterCount = text.length;
    const speakingDuration = calculateSpeakingDurationSec(segments);
    const charactersPerMinute = calculateCharactersPerMinute(characterCount, speakingDuration);
    const pauseAnalysis = analyzePauses(segments);
    const fillerAnalysis = analyzeFillers(text, characterCount);

    await supabase
      .from("diagnoses")
      .update({
        status: "processing",
        transcript: text,
        character_count: characterCount,
        speaking_duration: speakingDuration,
        characters_per_minute: charactersPerMinute,
        total_pause_count: pauseAnalysis.totalPauseCount,
        average_pause_duration: pauseAnalysis.averagePauseDurationSec,
        longest_pause_duration: pauseAnalysis.longestPauseDurationSec,
        filler_count: fillerAnalysis.totalCount,
        filler_details: fillerAnalysis.counts,
      })
      .eq("id", diagnosisId);

    // Phase 2の結果は保存済み。ここから先（AI診断）が失敗しても、
    // 上記の結果は失わず、statusは'processing'のままerror_messageだけ記録する。
    try {
      const speedJudgment = judgeSpeed(charactersPerMinute);
      const speedScore = scoreForSpeed(speedJudgment);
      const pauseScore = scoreForPauseTendency(pauseAnalysis.tendency);
      const fillerScore = scoreForFillerRate(fillerAnalysis.per100Characters);

      const aiResult = await diagnoseWithAI(text, {
        charactersPerMinute,
        speedJudgmentLabel: SPEED_JUDGMENT_LABEL[speedJudgment],
        pauseTendencyLabel: pauseAnalysis.tendency
          ? PAUSE_TENDENCY_LABEL[pauseAnalysis.tendency]
          : "検出なし",
        totalPauseCount: pauseAnalysis.totalPauseCount,
        fillerCount: fillerAnalysis.totalCount,
        fillerDetails: fillerAnalysis.counts,
      });

      const overallScore =
        speedScore +
        pauseScore +
        fillerScore +
        aiResult.scores.structure +
        aiResult.scores.clarity;

      await supabase
        .from("diagnoses")
        .update({
          status: "completed",
          overall_score: overallScore,
          score_details: {
            speed: speedScore,
            pause: pauseScore,
            filler: fillerScore,
            structure: aiResult.scores.structure,
            clarity: aiResult.scores.clarity,
          },
          strengths: aiResult.strengths,
          improvements: aiResult.improvements,
          practice_tips: aiResult.practiceTips,
          ai_summary: aiResult.summary,
          structure_analysis: aiResult.structureAnalysis,
          prompt_version: PROMPT_VERSION,
          model_name: DIAGNOSE_MODEL,
        })
        .eq("id", diagnosisId);
    } catch (aiError) {
      await supabase
        .from("diagnoses")
        .update({ error_message: toAiDiagnoseErrorMessage(aiError) })
        .eq("id", diagnosisId);
    }
  } catch (error) {
    await supabase
      .from("diagnoses")
      .update({
        status: "failed",
        error_message: toUserFacingErrorMessage(error),
      })
      .eq("id", diagnosisId);
  }

  return NextResponse.json({ id: diagnosisId });
}
