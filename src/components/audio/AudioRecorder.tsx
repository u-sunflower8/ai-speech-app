"use client";

import { useEffect, useRef, useState } from "react";
import { AUDIO_CONSTRAINTS } from "@/config/audio";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type RecorderState = "idle" | "recording" | "recorded";

function mimeTypeToExtension(mimeType: string): string {
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("ogg")) return "webm";
  return "webm";
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function AudioRecorder({
  onConfirm,
}: {
  onConfirm: (file: File, durationSec: number) => void;
}) {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    return () => {
      stopTimer();
      stopStream();
    };
  }, []);

  const handleStop = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const handleStart = async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        setRecordedBlob(blob);
        setState("recorded");
        stopTimer();
        stopStream();
      };

      recorder.start();
      startedAtRef.current = Date.now();
      setElapsedSec(0);
      setState("recording");

      intervalRef.current = setInterval(() => {
        const seconds = (Date.now() - startedAtRef.current) / 1000;
        setElapsedSec(seconds);
        if (seconds >= AUDIO_CONSTRAINTS.maxDurationSec) {
          handleStop();
        }
      }, 200);
    } catch {
      setPermissionError(
        "マイクの使用が許可されていません。ブラウザの設定からこのサイトのマイクへのアクセスを許可してください。"
      );
    }
  };

  const handleRedo = () => {
    setRecordedBlob(null);
    setElapsedSec(0);
    setState("idle");
  };

  const handleNext = () => {
    if (!recordedBlob) return;
    const recorder = mediaRecorderRef.current;
    const extension = mimeTypeToExtension(recorder?.mimeType ?? recordedBlob.type);
    const file = new File([recordedBlob], `recording.${extension}`, {
      type: recordedBlob.type,
    });
    onConfirm(file, elapsedSec);
  };

  const isTooShort = elapsedSec > 0 && elapsedSec < AUDIO_CONSTRAINTS.minDurationSec;

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">
        推奨録音時間は30秒〜1分です（最短{AUDIO_CONSTRAINTS.minDurationSec}秒 / 最長
        {Math.floor(AUDIO_CONSTRAINTS.maxDurationSec / 60)}分）。
      </p>

      {permissionError && (
        <Alert variant="destructive">
          <AlertDescription>{permissionError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-center gap-4 rounded-lg border border-neutral-200 bg-white py-10">
        <div
          className={`flex size-20 items-center justify-center rounded-full ${
            state === "recording" ? "animate-pulse bg-red-100" : "bg-neutral-100"
          }`}
        >
          <div
            className={`size-8 rounded-full ${
              state === "recording" ? "bg-red-500" : "bg-neutral-400"
            }`}
          />
        </div>
        <p className="font-mono text-2xl text-neutral-900">{formatTime(elapsedSec)}</p>

        {state === "idle" && <Button onClick={handleStart}>録音を開始する</Button>}
        {state === "recording" && (
          <Button variant="destructive" onClick={handleStop}>
            録音を停止する
          </Button>
        )}
      </div>

      {state === "recorded" && recordedBlob && (
        <div className="space-y-3">
          <AudioPlayer blob={recordedBlob} />
          {isTooShort && (
            <Alert variant="destructive">
              <AlertDescription>
                録音時間が短すぎます（最短{AUDIO_CONSTRAINTS.minDurationSec}秒）。やり直してください。
              </AlertDescription>
            </Alert>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRedo} className="flex-1">
              やり直す
            </Button>
            <Button onClick={handleNext} disabled={isTooShort} className="flex-1">
              次へ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
