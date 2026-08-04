"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <h1 className="text-xl font-semibold text-neutral-900">
        問題が発生しました
      </h1>
      <p className="max-w-sm text-sm text-neutral-600">
        一時的な通信エラーの可能性があります。もう一度お試しいただくか、しばらくしてから再度アクセスしてください。
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>もう一度試す</Button>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
          ダッシュボードへ戻る
        </Link>
      </div>
    </div>
  );
}
