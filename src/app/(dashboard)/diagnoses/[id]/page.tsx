import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DeleteDiagnosisButton } from "@/components/diagnoses/DeleteDiagnosisButton";

type Point = { title: string; description: string };
type ImprovementPoint = Point & { priority: number };
type ScoreDetails = {
  speed: number;
  pause: number;
  filler: number;
  structure: number;
  clarity: number;
};

const SCORE_LABELS: Record<keyof ScoreDetails, string> = {
  speed: "話すスピード",
  pause: "間の取り方",
  filler: "口癖",
  structure: "話の構成",
  clarity: "わかりやすさ",
};

export default async function DiagnosisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: diagnosis } = await supabase
    .from("diagnoses")
    .select(
      "id, title, status, created_at, audio_path, transcript, overall_score, score_details, strengths, improvements, practice_tips, ai_summary, error_message"
    )
    .eq("id", id)
    .single();

  if (!diagnosis) {
    notFound();
  }

  let audioUrl: string | null = null;
  if (diagnosis.audio_path) {
    const { data: signedUrlData } = await supabase.storage
      .from("audio-recordings")
      .createSignedUrl(diagnosis.audio_path, 60 * 60);
    audioUrl = signedUrlData?.signedUrl ?? null;
  }

  const scoreDetails = diagnosis.score_details as ScoreDetails | null;
  const strengths = diagnosis.strengths as Point[] | null;
  const improvements = diagnosis.improvements as ImprovementPoint[] | null;
  const practiceTips = diagnosis.practice_tips as Point[] | null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">
          {diagnosis.title || "無題の診断"}
        </h1>
        <p className="text-xs text-neutral-500">
          {new Date(diagnosis.created_at).toLocaleString("ja-JP")}
        </p>
      </div>

      {diagnosis.status === "failed" && (
        <Alert variant="destructive">
          <AlertDescription>
            {diagnosis.error_message ?? "診断に失敗しました。"}
          </AlertDescription>
        </Alert>
      )}

      {diagnosis.status === "pending" && (
        <Alert>
          <AlertDescription>処理を開始しています...</AlertDescription>
        </Alert>
      )}

      {diagnosis.status !== "failed" && diagnosis.overall_score != null && (
        <Card>
          <CardContent className="space-y-4 py-6">
            <div className="text-center">
              <span className="text-4xl font-bold text-neutral-900">
                {diagnosis.overall_score}
              </span>
              <span className="text-neutral-500"> / 100点</span>
            </div>
            {diagnosis.ai_summary && (
              <p className="text-center text-sm text-neutral-700">
                {diagnosis.ai_summary}
              </p>
            )}

            {scoreDetails && (
              <div className="space-y-3 pt-2">
                {(Object.keys(SCORE_LABELS) as (keyof ScoreDetails)[]).map(
                  (key) => (
                    <div key={key}>
                      <div className="mb-1 flex justify-between text-sm text-neutral-700">
                        <span>{SCORE_LABELS[key]}</span>
                        <span>{scoreDetails[key]} / 20点</span>
                      </div>
                      <Progress value={(scoreDetails[key] / 20) * 100} />
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {diagnosis.status === "processing" && diagnosis.overall_score == null && (
        <Alert>
          <AlertDescription>
            {diagnosis.error_message ??
              "AI診断を準備中です。しばらくしてからもう一度開いてください。"}
          </AlertDescription>
        </Alert>
      )}

      {strengths && strengths.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-neutral-900">
            良かった点
          </h2>
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium text-neutral-900">
                  {s.title}
                </span>
                <p className="text-neutral-600">{s.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {improvements && improvements.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-neutral-900">
            改善ポイント
          </h2>
          <ul className="space-y-2">
            {improvements.map((s, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium text-neutral-900">
                  {s.title}
                </span>
                <p className="text-neutral-600">{s.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {practiceTips && practiceTips.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-neutral-900">
            今日の練習
          </h2>
          <ul className="space-y-2">
            {practiceTips.map((s, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium text-neutral-900">
                  {s.title}
                </span>
                <p className="text-neutral-600">{s.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {diagnosis.transcript && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-neutral-900">
            文字起こし結果
          </h2>
          <Card>
            <CardContent className="py-4">
              <p className="whitespace-pre-wrap text-sm text-neutral-700">
                {diagnosis.transcript}
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {audioUrl && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-neutral-900">
            音声再生
          </h2>
          <audio src={audioUrl} controls className="w-full" />
        </section>
      )}

      <Separator />

      <div className="flex flex-wrap gap-3">
        <Link
          href="/diagnose/select"
          className={buttonVariants({ className: "flex-1" })}
        >
          もう一度診断する
        </Link>
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "outline", className: "flex-1" })}
        >
          履歴へ戻る
        </Link>
        <DeleteDiagnosisButton id={diagnosis.id} />
      </div>
    </div>
  );
}
