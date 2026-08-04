"use client";

import { useRouter } from "next/navigation";
import { AudioUploader } from "@/components/audio/AudioUploader";
import { setPendingAudio } from "../diagnose-flow-store";

export default function DiagnoseUploadPage() {
  const router = useRouter();

  const handleConfirm = (file: File, durationSec: number) => {
    setPendingAudio({ file, durationSec });
    router.push("/diagnose/confirm");
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-semibold text-neutral-900">音声ファイルをアップロード</h1>
      <AudioUploader onConfirm={handleConfirm} />
    </div>
  );
}
