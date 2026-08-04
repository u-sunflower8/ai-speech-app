"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getPendingAudio, clearPendingAudio } from "../diagnose-flow-store";

export default function DiagnoseConfirmPage() {
  const router = useRouter();
  const [pendingAudio] = useState(() => getPendingAudio());
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!pendingAudio) {
      router.replace("/diagnose/select");
    }
  }, [pendingAudio, router]);

  if (!pendingAudio) return null;

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("file", pendingAudio.file);
        formData.set("durationSec", String(pendingAudio.durationSec));
        if (title.trim()) formData.set("title", title.trim());

        const res = await fetch("/api/diagnoses", { method: "POST", body: formData });
        const body = await res.json();

        if (!res.ok) {
          setError(body.error ?? "保存に失敗しました。もう一度お試しください。");
          return;
        }

        clearPendingAudio();
        router.push(`/diagnoses/${body.id}`);
      } catch {
        setError(
          "通信エラーが発生しました。ネットワーク接続を確認してもう一度お試しください。"
        );
      }
    });
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-semibold text-neutral-900">内容を確認</h1>

      <AudioPlayer blob={pendingAudio.file} />

      <div className="space-y-2">
        <Label htmlFor="title">タイトル（任意）</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：面接練習 1回目"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Alert>
        <AlertDescription>
          保存すると、文字起こし・スピード/間/口癖の分析・AIによる総合診断が自動で行われます。分析には数秒〜数十秒かかることがあります。
        </AlertDescription>
      </Alert>

      <Button onClick={handleSave} disabled={isPending} className="w-full">
        {isPending ? "保存・分析しています..." : "保存する"}
      </Button>
    </div>
  );
}
