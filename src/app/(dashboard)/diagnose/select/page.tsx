import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function DiagnoseSelectPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-semibold text-neutral-900">診断方法を選択</h1>

      <Link href="/diagnose/record">
        <Card className="border-neutral-200 transition-colors hover:border-neutral-400">
          <CardContent className="py-6">
            <h2 className="font-medium text-neutral-900">その場で録音する</h2>
            <p className="mt-1 text-sm text-neutral-600">
              ブラウザのマイクを使ってその場で音声を録音します。
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/diagnose/upload">
        <Card className="border-neutral-200 transition-colors hover:border-neutral-400">
          <CardContent className="py-6">
            <h2 className="font-medium text-neutral-900">音声ファイルをアップロードする</h2>
            <p className="mt-1 text-sm text-neutral-600">
              録音済みの音声ファイル（mp3 / wav / m4a / webm）を選択します。
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
