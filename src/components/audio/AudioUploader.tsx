"use client";

import { useRef, useState } from "react";
import { AUDIO_CONSTRAINTS } from "@/config/audio";
import { audioFileSchema } from "@/lib/validation/audio";
import { getAudioDuration } from "@/lib/audio/duration";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AudioUploader({
  onConfirm,
}: {
  onConfirm: (file: File, durationSec: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const reset = () => {
    setFile(null);
    setDurationSec(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setError(null);
    setIsValidating(true);
    try {
      const result = await audioFileSchema.safeParseAsync(selected);
      if (!result.success) {
        setError(result.error.issues[0]?.message ?? "このファイルは利用できません。");
        setFile(null);
        setDurationSec(null);
        return;
      }

      const duration = await getAudioDuration(selected);
      setFile(selected);
      setDurationSec(duration);
    } catch {
      setError("このファイルを読み込めませんでした。別のファイルをお試しください。");
      setFile(null);
      setDurationSec(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleNext = () => {
    if (!file || durationSec === null) return;
    onConfirm(file, durationSec);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">
        対応形式: {AUDIO_CONSTRAINTS.allowedExtensions.join(" / ")}（最大
        {AUDIO_CONSTRAINTS.maxFileSizeBytes / (1024 * 1024)}MB、
        {AUDIO_CONSTRAINTS.minDurationSec}秒〜
        {Math.floor(AUDIO_CONSTRAINTS.maxDurationSec / 60)}分）
      </p>

      {!file && (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center">
          <input
            ref={inputRef}
            type="file"
            accept=".mp3,.wav,.m4a,.webm,audio/*"
            onChange={handleFileChange}
            className="mx-auto block text-sm"
          />
          {isValidating && (
            <p className="mt-2 text-sm text-neutral-500">確認しています...</p>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {file && durationSec !== null && (
        <div className="space-y-3">
          <p className="text-sm text-neutral-700">{file.name}</p>
          <AudioPlayer blob={file} />
          <div className="flex gap-3">
            <Button variant="outline" onClick={reset} className="flex-1">
              選び直す
            </Button>
            <Button onClick={handleNext} className="flex-1">
              次へ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
