import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <h1 className="text-xl font-semibold text-neutral-900">
        ページが見つかりません
      </h1>
      <p className="max-w-sm text-sm text-neutral-600">
        お探しのページは存在しないか、削除された可能性があります。
      </p>
      <Link href="/" className={buttonVariants()}>
        トップへ戻る
      </Link>
    </div>
  );
}
