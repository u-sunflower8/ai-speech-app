import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { judgeSpeed, SPEED_JUDGMENT_LABEL } from "@/config/speed";

const STATUS_LABEL: Record<string, string> = {
  pending: "保存済み（診断待ち）",
  processing: "分析済み（AI診断待ち）",
  completed: "診断完了",
  failed: "診断エラー",
};

const TRANSCRIPT_EXCERPT_LENGTH = 80;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: diagnoses } = await supabase
    .from("diagnoses")
    .select(
      "id, title, status, created_at, transcript, characters_per_minute, total_pause_count, filler_count, error_message, overall_score, ai_summary"
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            こんにちは、{user?.email} さん
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            これまでの診断件数: {diagnoses?.length ?? 0} 件
          </p>
        </div>
        <Link href="/diagnose/select" className={buttonVariants({ size: "lg" })}>
          新しい診断
        </Link>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium text-neutral-700">診断履歴</h2>
        {!diagnoses || diagnoses.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-neutral-500">
              まだ診断がありません。「新しい診断」から音声を録音してみましょう。
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {diagnoses.map((d) => {
              const hasAnalysis =
                (d.status === "processing" || d.status === "completed") &&
                !!d.transcript;
              const excerpt = d.transcript
                ? d.transcript.length > TRANSCRIPT_EXCERPT_LENGTH
                  ? `${d.transcript.slice(0, TRANSCRIPT_EXCERPT_LENGTH)}...`
                  : d.transcript
                : null;
              const cpm = d.characters_per_minute;

              return (
                <Link key={d.id} href={`/diagnoses/${d.id}`} className="block">
                  <Card className="transition-colors hover:border-neutral-400">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-neutral-900">
                            {d.title || "無題の診断"}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {new Date(d.created_at).toLocaleString("ja-JP")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {d.status === "completed" && d.overall_score != null && (
                            <span className="text-lg font-bold text-neutral-900">
                              {d.overall_score}
                              <span className="text-xs font-normal text-neutral-500">
                                /100
                              </span>
                            </span>
                          )}
                          <Badge variant="secondary">
                            {STATUS_LABEL[d.status] ?? d.status}
                          </Badge>
                        </div>
                      </div>

                      {d.status === "failed" && d.error_message && (
                        <p className="mt-3 text-sm text-red-600">
                          {d.error_message}
                        </p>
                      )}

                      {d.status === "processing" && d.error_message && (
                        <p className="mt-3 text-sm text-neutral-500">
                          {d.error_message}
                        </p>
                      )}

                      {d.status === "completed" && d.ai_summary && (
                        <>
                          <Separator className="my-3" />
                          <p className="text-sm text-neutral-700">
                            {d.ai_summary}
                          </p>
                        </>
                      )}

                      {d.status !== "completed" && hasAnalysis && (
                        <>
                          <Separator className="my-3" />
                          <p className="text-sm text-neutral-600">{excerpt}</p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-600">
                            {cpm != null && (
                              <Badge variant="outline">
                                話すスピード: {Math.round(cpm)}文字/分（
                                {SPEED_JUDGMENT_LABEL[judgeSpeed(cpm)]}）
                              </Badge>
                            )}
                            {d.total_pause_count != null && (
                              <Badge variant="outline">
                                間: {d.total_pause_count}回
                              </Badge>
                            )}
                            {d.filler_count != null && (
                              <Badge variant="outline">
                                口癖: {d.filler_count}回
                              </Badge>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
