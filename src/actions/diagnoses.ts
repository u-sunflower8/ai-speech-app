"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function deleteDiagnosis(id: string): Promise<{ error?: string } | undefined> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です。" };
  }

  const { data: diagnosis } = await supabase
    .from("diagnoses")
    .select("audio_path")
    .eq("id", id)
    .single();

  if (!diagnosis) {
    return { error: "診断データが見つかりません。" };
  }

  if (diagnosis.audio_path) {
    await supabase.storage.from("audio-recordings").remove([diagnosis.audio_path]);
  }

  // RLSにより、認証中ユーザー自身の行にしかヒットしない。
  const { error } = await supabase.from("diagnoses").delete().eq("id", id);

  if (error) {
    return { error: "削除に失敗しました。もう一度お試しください。" };
  }

  redirect("/dashboard");
}
